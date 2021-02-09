import { CustomViewCRD, DashboardConfigCRD, defaultConfig, TEMPLATE_GROUP } from '../../constants';
import { message } from 'antd';
import ApiManager from './ApiManager';
import { resourceNotifyEvent } from '../../resources/common/ResourceUtils';
import Utils from '../Utils';

/**
 * Class to manage all the interaction with the cluster
 *
 */

export default function ApiInterface(_user, tokenLogout) {

  const CRDs = {current: [DashboardConfigCRD, CustomViewCRD]};
  const customViews = {current: []};
  const dashConfigs = {current: {}};
  const namespace = {current: null};
  const watches = {current: []};
  /** Callback for the autocomplete search bar */
  const autoCompleteCallback = {current: []};
  /** Callback array for CRDs in CRD view */
  const CRDArrayCallback = {current: []};
  /** Callback for the favourites CRDs in the sidebar */
  const sidebarCallback = {current: null};
  /** Callback array for custom views */
  const CVArrayCallback = {current: []};
  /** Callback array for dashboard config */
  const DCArrayCallback = {current: []};
  /** Callback array for namespace change */
  const NSArrayCallback = {current: []};

  const user = {current: _user};
  const apiManager = {current: ApiManager(_user)};

  const setUser = (_user) => {
    user.current = _user;
    apiManager.current = ApiManager(_user);
    return user.current;
  }

  /** Set the global current namespace */
  const setNamespace = (_namespace) => {
    if(_namespace === 'all namespaces')
      namespace.current = null;
    else namespace.current = _namespace;

    NSArrayCallback.current.forEach(cb => cb());
  }

  const checkTokenExp = () => {
    if(tokenLogout && Utils().parseJWT() && Utils().parseJWT().exp &&
      (Utils().parseJWT().exp - (Date.now()/1000)) <= 0
    )
      tokenLogout();
  }

  /** Handle errors: if 401 or 403 log out */
  const handleError = (error) => {
    checkTokenExp();
    if(!error)
      return Promise.reject(error);
    else if(error.response && error.response._fetchResponse.status)
      return Promise.reject(error.response._fetchResponse.status);
    else if(error === 401 || error === 403)
      return Promise.reject(error);
    return Promise.reject(error.response ? error.response._fetchResponse.status : error);
  }

  /**
   * Function called to retrieve all CRDs in the cluster and all the custom resources associated with these CRDs
   *
   * @returns a list of CRDs: {CRD, custom_resource}
   */
  const getCRDs = () => {
    return apiManager.current.getCRDs()
      .then(res => {
        CRDs.current = res.body.items;
        /** update CRDs in the views */
        manageCallbackCRDs(CRDs.current);
      }).then(() => {
        watchResource(
          'apis',
          'apiextensions.k8s.io',
          undefined,
          'v1beta1',
          'customresourcedefinitions/',
          undefined,
          CRDsNotifyEvent);
      }).catch(error => handleError(error));
  }

  /** Get a CRD from its Kind */
  const getCRDFromKind = kind => {
    return CRDs.current.find((item) => {
      return item.spec.names.kind === kind;
    });
  }

  /** Get a CRD from its Name */
  const getCRDFromName = name => {
    return CRDs.current.find((item) => {
      return item.metadata.name === name;
    });
  }

  /** Get the CRDs for the group dashboard.liqo.io */
  const getTemplates = () => {
    let templates = [];
    CRDs.current.forEach(CRD => {
      if(CRD.spec.group === TEMPLATE_GROUP && CRD.spec.names.kind !== 'View'){
        templates.push(CRD.spec.names);
      }
    });
    return templates;
  }

  /** Load Dashboard Configs CRs */
  const loadDashboardCRs = kind => {
    let CRD = getCRDFromKind(kind);

    if(CRD){
      /** First get all the CR */
      return getCustomResourcesAllNamespaces(CRD)
        .then((res) => {
          if(kind === 'DashboardConfig'){
            if(res.body.items.length > 0){
              manageDC(res.body.items);
            } else {
              /** If there is no config, create one */
              createNewDC(CRD);
            }
            /** Then set up a watch to watch changes in the CR of the CRD */
            watchResource(
              'apis',
              CRD.spec.group,
              undefined,
              CRD.spec.version,
              CRD.spec.names.plural + '/',
              undefined,
              DCsNotifyEvent);
          }else{
            customViews.current = res.body.items;
            /** update CVs in the views */
            manageCallbackCVs();

            /** Then set up a watch to watch changes in the CR of the CRD */
            watchResource(
              'apis',
              CRD.spec.group,
              undefined,
              CRD.spec.version,
              CRD.spec.names.plural + '/',
              undefined,
              CVsNotifyEvent);
          }
        }).catch(error => {
          if(kind === 'DashboardConfig'){
            return getGenericResource('/apis/dashboard.liqo.io/v1alpha1/dashboardconfigs/default-config')
              .then(res => {
                dashConfigs.current = res;
                /** update CDs in the views */
                manageCallbackDCs();
              }).catch(error => console.log(error));
          }
        });
    }
  }

  const manageDC = res => {
    let defaultConfig;
    let enabledConfigs = res.filter(item => item.spec.enabled);
    if(enabledConfigs) {
      defaultConfig = enabledConfigs.find(item => item.spec.default);
      enabledConfigs.forEach(config => {
        const role = config.spec.role;
        if(role && role.roleType && role.roleName && Utils().parseJWT()){
          if(Utils().parseJWT()[role.roleType] === role.roleName ||
            Utils().parseJWT()[role.roleType].includes(role.roleName)
          ) {
            defaultConfig = config;
          }
        }
      })
    }

    if (!defaultConfig) {
      defaultConfig = res[0];
    }

    dashConfigs.current = defaultConfig;
    /** update CDs in the views */
    manageCallbackDCs();
  }

  const createNewDC = (CRD) => {
    /** If there is no config, create one */
    createCustomResource(
      CRD.spec.group,
      CRD.spec.version,
      undefined,
      CRD.spec.names.plural,
      defaultConfig
    ).then(res => {
      dashConfigs.current = res.body;
      /** update CDs in the views */
      manageCallbackDCs();
    })
  }

  /**
   * Function called to retrieve all custom resource of a CRD in a namespaces
   *
   * @param item is the CRD
   * @param namespace is the namespace of the resource
   * @returns a list of the custom resources
   */
  const getCustomResources = (item, namespace, fieldSelector) => {
    return apiManager.current.getCustomResources(item, namespace, fieldSelector)
      .catch(error => handleError(error));
  }

  /**
   * Function called to retrieve all custom resource of a CRD in all namespaces
   *
   * @param item is the CRD
   * @returns a list of the custom resources
   */
  const getCustomResourcesAllNamespaces = (item, fieldSelector) => {
    if(namespace.current && item.spec.scope === 'Namespaced')
      return getCustomResources(item, namespace.current, fieldSelector)
        .catch(error => handleError(error));
    else
      return apiManager.current.getCustomResourcesAllNamespaces(item, fieldSelector)
        .catch(error => handleError(error));
  }

  /**
   *
   * @param group of the CR
   * @param version of the CR
   * @param namespace of the CR
   * @param plural of the CR
   * @param name of the CR
   * @returns a promise
   */
  const deleteCustomResource = (group, version, namespace, plural, name) => {
    return apiManager.current.deleteCustomResource(group, version, namespace, plural, name)
      .catch(error => handleError(error));
  }

  /**
   * Function that create a new custom resource
   *
   * @param group of the CR
   * @param version of the CR
   * @param namespace of the custom resource
   * @param plural of the CR
   * @param item is the CR
   * @returns a promise
   */
  const createCustomResource = (group, version, namespace, plural, item) => {
    return apiManager.current.createCustomResource(group, version, namespace, plural, item)
      .catch(error => handleError(error));
  }

  /**
   * Function that update a custom resource
   *
   * @param group of the CR
   * @param version of the CR
   * @param namespace of the custom resource
   * @param plural of the CR
   * @param name of the CR
   * @param item is the CR
   * @returns a promise
   */
  const updateCustomResource = (group, version, namespace, plural, name, item) => {
    return apiManager.current.updateCustomResource(group, version, namespace, plural, name, item)
      .catch(error => handleError(error));
  }

  /**
   * Function that update a CR
   *
   * @param name of the CR to update
   * @param item of the CR
   * @returns a promise
   */
  const updateCustomResourceDefinition = (name, item) => {
    return apiManager.current.updateCustomResourceDefinition(name, item)
      .catch(error => handleError(error));
  }

  /**
   * This watch report changes of the CRs in a CRD
   */
  const watchResource = (api, group, namespace, version, plural, name, func) => {
    /** We don't want two of the same watch */
    if(watches.current.find(item => {return item.plural === plural})){
      return;
    }

    let controller = new AbortController();

    let queryParams = name ? {fieldSelector: 'metadata.name=' + name} : {}

    let watch = {
      controller: controller,
      api: api,
      group: group,
      namespace: namespace,
      version: version,
      plural: plural,
      name: name,
      callback: func
    }

    watches.current.push(watch);

    let path = '/' +
      api + '/' +
      (group ? group + '/' : '') +
      version + '/' +
      (namespace ? 'namespaces/' + namespace + '/' : '') +
      plural;

    triggerWatch(path, watch, controller, func, queryParams);
    return controller;
  }

  const triggerWatch = (path, watch, controller, func, queryParams) => {
    let signal = controller.signal;

    let done = function(type){
      /** If the watch stops */
      if(!type){
        if(abortWatch(watch.plural)){
          /**
           * If it's an always needed watch that stopped, we need to do an extra step
           */
          if(watch.plural === 'views/' ||
            watch.plural === 'customresourcedefinitions/' ||
            watch.plural === 'dashboardconfigs/'
          ){
            watches.current = watches.current.filter(item => {return item.plural !== watch.plural});
          }
          watchResource(
            watch.api,
            watch.group,
            watch.namespace,
            watch.version,
            watch.plural,
            watch.name,
            func);
        }
      }
    }

    apiManager.current.watchFunction(path, func, done, signal, queryParams);
  }

  const abortWatch = watch => {
    /** These watch need to always be up and restarted if aborted */
    if(watch === 'views/' || watch === 'customresourcedefinitions/' || watch === 'dashboardconfigs/') return true;

    let w = watches.current.find(item => {return item.plural === watch});
    if(w){
      /** Here if we want to restart the watch: abort it and it will be restarted */
      w.controller.abort();
      watches.current = watches.current.filter(item => item.plural !== watch);
      return true;
    }
    /** Here if the watcher has already been aborted (because we wanted to), don't restart it */
    return false;
  }

  /**
   * Callback used by the CRDs watcher trigger (if the CRD is changed)
   * @param type: description of the trigger (modify/add/delete)
   * @param object: object modified/added/deleted
   */
  const CRDsNotifyEvent = (type, object) => {

    /**
     * When the watcher starts it returns the state of the k8s system,
     *  so every CRD that's in the system will be returned with type: ADDED
     *  To avoid the computational overhead of that, filter out the CRD that
     *  are in fact not changed (field resourceVersion)
     */
    let CRD = CRDs.current.find((item) => {
      return item.metadata.name === object.metadata.name;
    });
    if(type === 'ADDED' && CRD &&
      CRD.metadata.resourceVersion === object.metadata.resourceVersion){
      return;
    }

    if ((type === 'ADDED' || type === 'MODIFIED')) {
      // Object creation succeeded
      if(CRD) {
        if(CRD.metadata.resourceVersion !== object.metadata.resourceVersion){
          CRDs.current = CRDs.current.filter(item => {return item.metadata.name !== CRD.metadata.name});
          CRDs.current.push(object);
          CRDs.current.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
          message.success('CRD ' + object.metadata.name + ' modified');
          return manageCallbackCRDs(object, type);
        }
      } else {
        CRDs.current.push(object);
        CRDs.current.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
        message.success('CRD ' + object.metadata.name + ' added');
        return manageCallbackCRDs(object, type);
      }
    } else if (type === 'DELETED') {
      if(CRD) {
        CRDs.current = CRDs.current.filter(item => {return item.metadata.name !== CRD.metadata.name});
        message.success('CRD ' + object.metadata.name + ' deleted');
        return manageCallbackCRDs(object, type);
      }
    }
  }

  const manageCallbackCRDs = (object, type) => {
    /** update CRDs in the search bar */
    autoCompleteCallback.current.forEach(cb => {
      cb();
    })

    /** update CRDs in the CRD views */
    CRDArrayCallback.current.forEach(func => {
      func(CRDs.current, object, type);
    })

    /** update CRDs in the sidebar */
    if(sidebarCallback.current)
      sidebarCallback.current(CRDs.current.filter(item => {
        return item.metadata.annotations && item.metadata.annotations.favourite;
      }));
  }

  const CVsNotifyEvent = (type, object) => {

    let CV = customViews.current.find(item => {
      return item.metadata.name === object.metadata.name;
    });

    if ((type === 'ADDED' || type === 'MODIFIED')) {
      // Object creation succeeded
      if(CV) {
        if(CV.metadata.resourceVersion !== object.metadata.resourceVersion){
          customViews.current = customViews.current.filter(item => {return item.metadata.name !== CV.metadata.name});
          customViews.current.push(object);
          customViews.current.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
          message.success('View ' + object.metadata.name + ' modified');
          manageCallbackCVs();
        }
      } else {
        customViews.current.push(object);
        customViews.current.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
        message.success('View ' + object.metadata.name + ' added');
        manageCallbackCVs();
      }
    } else if (type === 'DELETED') {
      if(CV) {
        customViews.current = customViews.current.filter(item => {return item.metadata.name !== CV.metadata.name});
        message.success('View ' + object.metadata.name + ' deleted');
        manageCallbackCVs();
      }
    }
  }

  const manageCallbackCVs = () =>{
    /** update custom views */
    return CVArrayCallback.current.forEach(func => {
      func();
    })
  }

  const DCsNotifyEvent = (type, object) => {
    loadDashboardCRs('DashboardConfig');
  }

  const manageCallbackDCs = () =>{
    /** update custom views */
    return DCArrayCallback.current.forEach(func => {
      func();
    })
  }

  /** gets all namespaces with label */
  const getNamespaces = label => {
    return apiManager.current.getNamespaces(label)
      .catch(error => handleError(error));
  }

  /** gets all the pods in namespace */
  const getPODs = (_namespace, fieldSelector) => {
    return apiManager.current.getPODs(_namespace)
      .catch(error => handleError(error));
  }

  /** gets all the pods in all namespace */
  const getPODsAllNamespaces = (fieldSelector) => {
    if(namespace.current)
      return getPODs(namespace.current, fieldSelector)
        .catch(error => handleError(error));
    else
      return apiManager.current.getPODsAllNamespaces(fieldSelector)
        .catch(error => handleError(error));
  }

  /** gets the list of all the nodes in cluster */
  const getNodes = () => {
    return apiManager.current.getNodes();
  }

  /** gets the metrics of pods for a specific namespace */
  const getMetricsPOD = (_namespace, name) => {
    let path = window.APISERVER_URL + '/apis/metrics.k8s.io/v1beta1/namespaces/' + _namespace + '/pods/' + name;

    return apiManager.current.fetchMetrics(path);
  }

  /** gets the metrics of all the nodes on the cluster */
  const getMetricsNodes = () => {
    let path = window.APISERVER_URL + '/apis/metrics.k8s.io/v1beta1/nodes'

    return apiManager.current.fetchMetrics(path);
  }

  const getConfigMaps = (_namespace, fieldSelector) => {
    return apiManager.current.getConfigMaps(_namespace, fieldSelector)
      .catch(error => handleError(error));
  }

  const getApis = () => {
    return apiManager.current.getApis()
      .catch(error => handleError(error));
  }

  const getGenericResource = (partialPath, setItems, noNamespaceCheck, notifyFunc) => {
    let path = window.APISERVER_URL + partialPath;

    return apiManager.current.fetchRaw(path, 'GET')
      .then(res => {
        if(setItems){
          if(!notifyFunc){
            notifyFunc = (type, object) => {
              resourceNotifyEvent(setItems, type, object, noNamespaceCheck);
            }
          }
          const array = partialPath.split('/');
          if(array[1] === 'api'){
            watchResource(
              array[1],
              undefined,
              array[3] === 'namespaces' ? array[4] : undefined,
              array[2],
              array[3] === 'namespaces' ? array[5] : array[3],
              array[3] === 'namespaces' ? array[6] : array[4],
              notifyFunc
            )
          }else{
            watchResource(
              array[1],
              array[2],
              array[4] === 'namespaces' ? array[5] : undefined,
              array[3],
              array[4] === 'namespaces' ? array[6] : array[4],
              array[4] === 'namespaces' ? array[7] : array[5],
              notifyFunc
            )
          }
        }
        return res;
      })
      .catch(error => handleError(error));
  }

  const createGenericResource = (partialPath, item) => {
    let path = window.APISERVER_URL + partialPath;

    return apiManager.current.fetchRaw(path, 'POST', item)
      .catch(error => handleError(error));
  }

  const updateGenericResource = (partialPath, item) => {
    let path = window.APISERVER_URL + partialPath;

    return apiManager.current.fetchRaw(path, 'PATCH', item)
      .catch(error => handleError(error));
  }

  const deleteGenericResource = (partialPath) => {
    let path = window.APISERVER_URL + partialPath;

    return apiManager.current.fetchRaw(path, 'DELETE')
      .catch(error => handleError(error));
  }

  const getPodLogs = partialPath => {
    let path = window.APISERVER_URL + partialPath + '/log';

    return apiManager.current.logFunction(path);
  }

  const getKubernetesJSONSchema = () => {
    return fetch('https://kubernetesjsonschema.dev/master/_definitions.json').then(r => r.json())
      .catch(error => console.log(error));
  }

  /**
   *
   * @param name: the name of the CRD to retrieve
   * @param setItems: the function to set items results
   * @param notifyFunc: the notify function for the watch
   * @param setLoading: the function to set loading true or false
   */
  const loadCRD = (name, setItems, notifyFunc, setLoading) => {
    let CRD;

    if(!notifyFunc){
      notifyFunc = (type, object) => {
        resourceNotifyEvent(setItems, type, object);
      }
    }

    if(setLoading) setLoading(true);

    CRD = getCRDFromName(name);

    if(CRD){
      getCustomResourcesAllNamespaces(CRD).then(res => {

        setItems(res.body.items);

        /** Then set up a watch to watch changes in the CRs of the CRD */
        watchResource(
          'apis',
          CRD.spec.group,
          undefined,
          CRD.spec.version,
          CRD.spec.names.plural,
          undefined,
          notifyFunc
        );

        if(setLoading) setLoading(false);

      }).catch(error => {
        console.log(error);
        if(setLoading) setLoading(false);
      })
    } else {
      if(setLoading) setLoading(false);
    }
  }

  return {
    user,
    CRDs,
    customViews,
    dashConfigs,
    namespace,
    watches,
    autoCompleteCallback,
    CRDArrayCallback,
    sidebarCallback,
    CVArrayCallback,
    DCArrayCallback,
    NSArrayCallback,
    apiManager,
    getConfigMaps,
    getMetricsNodes,
    getMetricsPOD,
    getNodes,
    getPODs,
    getPODsAllNamespaces,
    getNamespaces,
    CRDsNotifyEvent,
    abortWatch,
    watchResource,
    updateCustomResourceDefinition,
    updateCustomResource,
    createCustomResource,
    deleteCustomResource,
    getCustomResources,
    getCustomResourcesAllNamespaces,
    loadDashboardCRs,
    getTemplates,
    getCRDFromName,
    getCRDFromKind,
    getCRDs,
    setUser,
    manageCallbackCVs,
    manageCallbackDCs,
    setNamespace,
    getApis,
    getGenericResource,
    createGenericResource,
    updateGenericResource,
    deleteGenericResource,
    getPodLogs,
    getKubernetesJSONSchema,
    loadCRD,
  }

}
