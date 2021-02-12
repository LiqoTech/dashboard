import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/app/App';
import _ from 'lodash';
import CRDmockResponse from '../__mocks__/crd_fetch.json';
import ViewMockResponseLayout from '../__mocks__/views_withLayout.json';
import ViewMockResponse from '../__mocks__/views.json';
import NewViewMockResponse from '../__mocks__/views_another.json';
import React from 'react';
import userEvent from '@testing-library/user-event';
import AdvMockResponse from '../__mocks__/advertisement.json';
import TunnMockResponse from '../__mocks__/tunnelendpoints.json';
import LiqoDashMockResponse from '../__mocks__/liqodashtest.json';
import PieMockResponse from '../__mocks__/piecharts.json';
import HistoMockResponse from '../__mocks__/histocharts.json';
import LiqoDashNewMockResponse from '../__mocks__/liqodashtest_new.json';
import LiqoDashUpdatedMockResponse from '../__mocks__/liqodashtest_update.json';
import FCMockResponse from '../__mocks__/foreigncluster.json';
import FCMockNew from '../__mocks__/foreigncluster_new.json';
import PRMockResponse from '../__mocks__/peeringrequest.json';
import ConfigMockResponse from '../__mocks__/configs.json';
import ConfigMockResponseUpdated from '../__mocks__/configs_updated.json';
import PodsMockResponse from '../__mocks__/pods.json';
import Error409 from '../__mocks__/409.json';
import Error401 from '../__mocks__/401.json';
import NodesMockResponse from '../__mocks__/nodes.json';
import NodesMetricsMockResponse from '../__mocks__/nodes_metrics.json';
import PodsMetricsMockResponse from '../__mocks__/pods_metrics.json';
import CMMockResponse from '../__mocks__/configmap_clusterID.json';
import ApisMockResponse from '../__mocks__/apis.json';
import ApiV1MockResponse from '../__mocks__/apiv1.json';
import AppsResponse from '../__mocks__/apps.json';
import ApiExtResponse from '../__mocks__/apiextension.k8s.io.json';
import ConfigGroup from '../__mocks__/config.liqo.io.json';
import DashboardGroup from '../__mocks__/dashboard.liqo.io.json';
import DiscoveryGroup from '../__mocks__/discovery.liqo.io.json';
import NetGroup from '../__mocks__/net.liqo.io.json';
import SchedulingGroup from '../__mocks__/scheduling.liqo.io.json';
import SharingGroup from '../__mocks__/sharing.liqo.io.json';
import NamespaceResponse from '../__mocks__/namespaces.json';
import PodMockResponse from '../__mocks__/pod.json';
import DashboardConfig from '../__mocks__/dashboardconf.json';
import K8sSchemaDefinitions from '../__mocks__/kubernetesjsonschema.json';
import DeploymentMockResponse from '../__mocks__/deployments.json';

import Cookies from 'js-cookie';

export function setup_login() {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
}

export const token =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IndKaG9sSTRybXVVNEhEMjFIbG84dlFPU253Z01ORkRaa0hVYVl2b2V6MDQifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJsaXFvIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImxpcW9kYXNoLWFkbWluLXNhLXRva2VuLXpkdnRsIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImxpcW9kYXNoLWFkbWluLXNhIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiNWI5NGIzNTctZjk0ZS00MDdmLWExMTEtNTFmYzM0N2VlOTE2Iiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmxpcW86bGlxb2Rhc2gtYWRtaW4tc2EifQ.AbRawOTf_adeeJIoA0t0bs9NUa8FSQAPyprFT4glyZuqRc5cDwR3NojwBXh7NWLLb76SpWTn7A95wVz2DxsDTqCQg48ebNgyL892Rfw28s7mfbgMb_WrSkfj3zSS6MYggrIU6MJ4Zvguaz3Qe8AyDBiggn9cZGeR0lod8knlvAnPcYBkHFbBlMr-GfX6MEcMdD5Hf5RvIdIdi8iHFrJESg08haCIuVKSZIWMbIOE5-Yx0-J6wK8u4bS8rDJMv_gAMNd_ijSMpv7rJzOcEvRsoLBa-3C12J_eQrdeIhdHbzG7cmEK4-D2HYoUNd5XQY6clQLTg3w3GhupScH2TcvTsg eyJhbGciOiJSUzI1NiIsImtpZCI6IndKaG9sSTRybXVVNEhEMjFIbG84dlFPU253Z01ORkRaa0hVYVl2b2V6MDQifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJsaXFvIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImxpcW9kYXNoLWFkbWluLXNhLXRva2VuLXpkdnRsIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImxpcW9kYXNoLWFkbWluLXNhIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiNWI5NGIzNTctZjk0ZS00MDdmLWExMTEtNTFmYzM0N2VlOTE2Iiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmxpcW86bGlxb2Rhc2gtYWRtaW4tc2EifQ.AbRawOTf_adeeJIoA0t0bs9NUa8FSQAPyprFT4glyZuqRc5cDwR3NojwBXh7NWLLb76SpWTn7A95wVz2DxsDTqCQg48ebNgyL892Rfw28s7mfbgMb_WrSkfj3zSS6MYggrIU6MJ4Zvguaz3Qe8AyDBiggn9cZGeR0lod8knlvAnPcYBkHFbBlMr-GfX6MEcMdD5Hf5RvIdIdi8iHFrJESg08haCIuVKSZIWMbIOE5-Yx0-J6wK8u4bS8rDJMv_gAMNd_ijSMpv7rJzOcEvRsoLBa-3C12J_eQrdeIhdHbzG7cmEK4-D2HYoUNd5XQY6clQLTg3w3GhupScH2TcvTsg eyJhbGciOiJSUzI1NiIsImtpZCI6IndKaG9sSTRybXVVNEhEMjFIbG84dlFPU253Z01ORkRaa0hVYVl2b2V6MDQifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJsaXFvIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImxpcW9kYXNoLWFkbWluLXNhLXRva2VuLXpkdnRsIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImxpcW9kYXNoLWFkbWluLXNhIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiNWI5NGIzNTctZjk0ZS00MDdmLWExMTEtNTFmYzM0N2VlOTE2Iiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmxpcW86bGlxb2Rhc2gtYWRtaW4tc2EifQ.AbRawOTf_adeeJIoA0t0bs9NUa8FSQAPyprFT4glyZuqRc5cDwR3NojwBXh7NWLLb76SpWTn7A95wVz2DxsDTqCQg48ebNgyL892Rfw28s7mfbgMb_WrSkfj3zSS6MYggrIU6MJ4Zvguaz3Qe8AyDBiggn9cZGeR0lod8knlvAnPcYBkHFbBlMr-GfX6MEcMdD5Hf5RvIdIdi8iHFrJESg08haCIuVKSZIWMbIOE5-Yx0-J6wK8u4bS8rDJMv_gAMNd_ijSMpv7rJzOcEvRsoLBa-3C12J_eQrdeIhdHbzG7cmEK4-D2HYoUNd5XQY6clQLTg3w3GhupScH2TcvTsg';

export function setToken() {
  let _token = token;
  for (let i = 0; i < 4; i++) _token = _token + _token;

  Cookies.set('token', _token);
}

export function metricsPODs(req, error) {
  if (error) {
    return Promise.reject(404);
  } /*else if (req.url === 'http://localhost:3001/metrics/pods/hello-world-deployment-6756549f5-x66v9') {
    return Promise.resolve(new Response(JSON.stringify(PodsMetricsMockResponse.podMetrics[0])));
  } else if (req.url === 'http://localhost:3001/metrics/pods/hello-world-deployment-6756549f5-c7qzv') {
    return Promise.resolve(new Response(JSON.stringify(PodsMetricsMockResponse.podMetrics[1])));
  } else if (req.url === 'http://localhost:3001/metrics/pods/hello-world-deployment-6756549f5-c7sx8') {
    return Promise.resolve(new Response(JSON.stringify(PodsMetricsMockResponse.podMetrics[2])));
  } */ else
    return Promise.resolve(
      new Response(JSON.stringify(PodsMetricsMockResponse.podMetrics[3]))
    );
}

export function alwaysPresentGET(url) {
  //console.log(url)
  if (
    url === 'http://localhost/apiserver/api/v1' ||
    url === 'http://localhost:/apiserver/api/v1'
  ) {
    return Promise.resolve(new Response(JSON.stringify(ApiV1MockResponse)));
  } else if (
    url ===
      'http://localhost:/apiserver/apis/apiextensions.k8s.io/v1/customresourcedefinitions' ||
    url ===
      'http://localhost/apiserver/apis/apiextensions.k8s.io/v1/customresourcedefinitions'
  ) {
    return Promise.resolve(new Response(JSON.stringify(CRDmockResponse)));
  } else if (
    url === 'https://kubernetesjsonschema.dev/master/_definitions.json'
  ) {
    return Promise.resolve(new Response(JSON.stringify(K8sSchemaDefinitions)));
  } else if (url === 'http://localhost:3001/apis/') {
    return Promise.resolve(
      new Response(JSON.stringify({ body: ApisMockResponse }))
    );
  } else if (
    url === 'http://localhost/apiserver/apis/apps/v1' ||
    url === 'http://localhost:/apiserver/apis/apps/v1'
  ) {
    return Promise.resolve(new Response(JSON.stringify(AppsResponse)));
  } else if (
    url === 'http://localhost/apiserver/apis/apiextensions.k8s.io/v1' ||
    url === 'http://localhost:/apiserver/apis/apiextensions.k8s.io/v1' ||
    url === 'http://localhost/apiserver/apis/apiextensions.k8s.io/v1beta1' ||
    url === 'http://localhost:/apiserver/apis/apiextensions.k8s.io/v1beta1'
  ) {
    return Promise.resolve(new Response(JSON.stringify(ApiExtResponse)));
  } else if (
    url === 'http://localhost/apiserver/apis/config.liqo.io/v1alpha1' ||
    url === 'http://localhost:/apiserver/apis/config.liqo.io/v1alpha1'
  ) {
    return Promise.resolve(new Response(JSON.stringify(ConfigGroup)));
  } else if (
    url === 'http://localhost/apiserver/apis/dashboard.liqo.io/v1alpha1' ||
    url === 'http://localhost:/apiserver/apis/dashboard.liqo.io/v1alpha1'
  ) {
    return Promise.resolve(new Response(JSON.stringify(DashboardGroup)));
  } else if (
    url ===
      'http://localhost/apiserver/apis/dashboard.liqo.io/v1alpha1/liqodashtests' ||
    url ===
      'http://localhost:/apiserver/apis/dashboard.liqo.io/v1alpha1/liqodashtests'
  ) {
    return Promise.resolve(new Response(JSON.stringify(LiqoDashMockResponse)));
  } else if (
    url === 'http://localhost/apiserver/apis/discovery.liqo.io/v1alpha1' ||
    url === 'http://localhost:/apiserver/apis/discovery.liqo.io/v1alpha1'
  ) {
    return Promise.resolve(new Response(JSON.stringify(DiscoveryGroup)));
  } else if (
    url === 'http://localhost/apiserver/apis/net.liqo.io/v1alpha1' ||
    url === 'http://localhost:/apiserver/apis/net.liqo.io/v1alpha1'
  ) {
    return Promise.resolve(new Response(JSON.stringify(NetGroup)));
  } else if (
    url === 'http://localhost/apiserver/apis/scheduling.liqo.io/v1alpha1' ||
    url === 'http://localhost:/apiserver/apis/scheduling.liqo.io/v1alpha1'
  ) {
    return Promise.resolve(new Response(JSON.stringify(SchedulingGroup)));
  } else if (
    url === 'http://localhost/apiserver/apis/sharing.liqo.io/v1alpha1' ||
    url === 'http://localhost:/apiserver/apis/sharing.liqo.io/v1alpha1'
  ) {
    return Promise.resolve(new Response(JSON.stringify(SharingGroup)));
  } /*else if (url === 'http://localhost/apiserver/apis/virtualkubelet.liqo.io/v1alpha1' || url === 'http://localhost:/apiserver/apis/virtualkubelet.liqo.io/v1alpha1') {
    return Promise.resolve(new Response(JSON.stringify(VKGroup)));
  }*/ else if (
    url === 'http://localhost:/apiserver/api/v1/pods' ||
    url === 'http://localhost/apiserver/api/v1/pods'
  ) {
    return Promise.resolve(new Response(JSON.stringify(PodsMockResponse)));
  } else if (
    url ===
      'http://localhost/apiserver/api/v1/namespaces/test/pods/hello-world-deployment-6756549f5-x66v9' ||
    url ===
      'http://localhost:/apiserver/api/v1/namespaces/test/pods/hello-world-deployment-6756549f5-x66v9'
  ) {
    return Promise.resolve(new Response(JSON.stringify(PodMockResponse)));
  } else if (
    url ===
      'http://localhost/apiserver/api/v1/namespaces/test/pods/hello-world-deployment-6756549f5-x66v9/log' ||
    url ===
      'http://localhost:/apiserver/api/v1/namespaces/test/pods/hello-world-deployment-6756549f5-x66v9/log'
  ) {
    return Promise.resolve(new Response('LogPodMockResponse'));
  } else if (
    url ===
      'http://localhost/apiserver/apis/apiextensions.k8s.io/v1/customresourcedefinitions' ||
    url ===
      'http://localhost:/apiserver/apis/apiextensions.k8s.io/v1/customresourcedefinitions'
  ) {
    //return Promise.resolve(new Response(JSON.stringify(CRDmockResponse)))
  } else if (
    url ===
      'http://localhost/apis/dashboard.liqo.io/v1alpha1/dashboardconfigs/default-config' ||
    url ===
      'http://localhost:/apiserver/apis/dashboard.liqo.io/v1alpha1/dashboardconfigs/default-config'
  ) {
    //return Promise.resolve(new Response(JSON.stringify(DashboardConfig.items[0])));
  } else if (
    url === 'http://localhost:3001/clustercustomobject/dashboardconfigs'
  ) {
    let dashconf = JSON.parse(JSON.stringify(DashboardConfig));
    if (window.api && !_.isEmpty(window.api.dashConfigs.current)) {
      window.api.dashConfigs.current.metadata.resourceVersion++;
      if (window.api.dashConfigs.current.spec.resources) {
        window.api.dashConfigs.current.spec.resources.forEach(item => {
          if (item.render && item.render.columns) {
            item.render.columns = item.render.columns.filter(
              col => col !== null
            );
          }
          if (item.render && item.render.tabs) {
            item.render.tabs = item.render.tabs.filter(tab => tab !== null);
          }
          return item;
        });
      }
      dashconf.items = [window.api.dashConfigs.current];
    }
    return Promise.resolve(new Response(JSON.stringify({ body: dashconf })));
  } else if (
    url === 'http://localhost:/apiserver/apis/apps/v1/deployments' ||
    url === 'http://localhost/apiserver/apis/apps/v1/deployments'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify(DeploymentMockResponse))
    );
  } else return false;
}

export function generalHomeGET(url) {
  if (url === 'http://localhost:3001/clustercustomobject/foreignclusters') {
    return Promise.resolve(
      new Response(JSON.stringify({ body: FCMockResponse }))
    );
  } else if (
    url === 'http://localhost:3001/clustercustomobject/advertisements'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: AdvMockResponse }))
    );
  } else if (
    url ===
    'http://localhost/apiserver/apis/net.liqo.io/v1alpha1/advertisements.protocol.liqo.io'
  ) {
    //return Promise.resolve(new Response(JSON.stringify(AdvMockResponse)));
  } else if (
    url === 'http://localhost:3001/clustercustomobject/peeringrequests'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: PRMockResponse }))
    );
  } else if (
    url === 'http://localhost:3001/clustercustomobject/clusterconfigs'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: ConfigMockResponse }))
    );
  } else if (url === 'http://localhost:3001/pod') {
    return Promise.resolve(
      new Response(JSON.stringify({ body: PodsMockResponse }))
    );
  } else if (url === 'http://localhost:3001/nodes') {
    return Promise.resolve(
      new Response(JSON.stringify({ body: NodesMockResponse }))
    );
  } /*else if (url === 'http://localhost:3001/metrics/nodes') {
    return Promise.resolve(new Response(JSON.stringify(NodesMetricsMockResponse)));
  }*/ else if (
    url === 'http://localhost:3001/configmaps/liqo'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: CMMockResponse }))
    );
  } else {
    return metricsPODs({ url: url });
  }
}

function responseManager(
  req,
  error,
  method,
  crd,
  crd_v,
  res_get,
  res_post,
  res_put
) {
  if (req.method === 'GET') {
    return Promise.resolve(new Response(JSON.stringify({ body: res_get })));
  } else if (req.method === 'POST') {
    if (error && method === 'POST') {
      if (error === '409') {
        return Promise.reject(Error409.body);
      }
    } else {
      return Promise.resolve(new Response(JSON.stringify({ body: res_post })));
    }
  } else if (req.method === 'PUT') {
    if (error && method === 'PUT') {
      if (error === '409') {
        return Promise.reject(Error409.body);
      }
    } else {
      return Promise.resolve(new Response(JSON.stringify({ body: res_put })));
    }
  } else if (req.method === 'DELETE') {
    if (error && method === 'DELETE') {
      return Promise.reject(Error401.body);
    } else {
      return Promise.resolve(new Response(JSON.stringify(res_get.items[0])));
    }
  }
}

export function generalMocks(url) {
  if (url === 'http://localhost:3001/customresourcedefinition') {
    return Promise.resolve(new Response(JSON.stringify(CRDmockResponse)));
  } /*else if (url === 'https://kubernetesjsonschema.dev/master/_definitions.json'){
    return Promise.resolve(new Response(JSON.stringify(K8sSchemaDefinitions)))
  }*/ /*else if (url === 'http://localhost:/apiserver/apis/apiextensions.k8s.io/v1/customresourcedefinitions') {
    return Promise.resolve(new Response(JSON.stringify(CRDmockResponse)))
  }*/ else if (
    url === 'http://localhost:3001/namespaces'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: NamespaceResponse }))
    );
  } else if (
    url === 'http://localhost:3001/clustercustomobject/foreignclusters'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: FCMockResponse }))
    );
  } else if (
    url === 'http://localhost:3001/clustercustomobject/advertisements' ||
    url ===
      'http://localhost/apiserver/apis/net.liqo.io/v1alpha1/advertisements.protocol.liqo.io'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: AdvMockResponse }))
    );
  } else if (
    url === 'http://localhost:3001/clustercustomobject/peeringrequests'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: PRMockResponse }))
    );
  } else if (
    url === 'http://localhost:3001/clustercustomobject/clusterconfigs'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: ConfigMockResponse }))
    );
  } else if (url === 'http://localhost:3001/clustercustomobject/views') {
    return Promise.resolve(
      new Response(JSON.stringify({ body: ViewMockResponse }))
    );
  } /*else if (url === 'http://localhost:3001/pod') {
    return Promise.resolve(new Response(JSON.stringify({body: PodsMockResponse})));
  }*/ else if (
    url === 'http://localhost:3001/nodes'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: NodesMockResponse }))
    );
  } /*else if (url === 'http://localhost:3001/metrics/nodes') {
    return Promise.resolve(new Response(JSON.stringify(NodesMetricsMockResponse)));
  } else if (url === 'http://localhost:3001/configmaps/liqo') {
    return Promise.resolve(new Response(JSON.stringify({body: CMMockResponse})));
  }*/ else if (
    alwaysPresentGET(url)
  ) {
    return alwaysPresentGET(url);
  } else {
    return metricsPODs({ url: url });
  }
}

export function mockCRDAndViewsExtended(error, method, crd, view) {
  fetch.mockResponse(req => {
    //console.log(req.url)
    if (req.url === 'http://localhost:3001/customresourcedefinition') {
      return Promise.resolve(new Response(JSON.stringify(CRDmockResponse)));
    } else if (req.url === 'http://localhost:3001/namespaces') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: NamespaceResponse }))
      );
    } else if (req.url === 'http://localhost:3001/clustercustomobject/views') {
      if (req.method === 'GET') {
        if (view) {
          return Promise.resolve(
            new Response(JSON.stringify({ body: ViewMockResponseLayout }))
          );
        } else {
          return Promise.resolve(
            new Response(JSON.stringify({ body: ViewMockResponse }))
          );
        }
      } else if (req.method === 'PUT') {
        //return Promise.resolve(new Response(JSON.stringify({body: ViewMockResponse})));
      } else if (req.method === 'POST') {
        return Promise.resolve(
          new Response(JSON.stringify({ body: NewViewMockResponse }))
        );
      }
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/liqodashtests'
    ) {
      return responseManager(
        req,
        error,
        method,
        crd,
        'liqodashtests',
        LiqoDashMockResponse,
        LiqoDashNewMockResponse,
        LiqoDashUpdatedMockResponse
      );
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/piecharts'
    ) {
      return Promise.resolve(
        new Response(JSON.stringify({ body: PieMockResponse }))
      );
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/histocharts'
    ) {
      return Promise.resolve(
        new Response(JSON.stringify({ body: HistoMockResponse }))
      );
    } /*else if (req.url === 'http://localhost:3001/clustercustomobject/graphs') {
      return Promise.resolve(new Response(JSON.stringify({body: GraphMockResponse })))
    } */ else if (
      req.url === 'http://localhost:3001/clustercustomobject/foreignclusters'
    ) {
      return responseManager(
        req,
        error,
        method,
        crd,
        'foreignclusters',
        FCMockResponse,
        FCMockNew,
        null
      );
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/advertisements'
    ) {
      let advPut = AdvMockResponse.items[0];
      advPut.metadata.resourceVersion++;
      return responseManager(
        req,
        error,
        method,
        crd,
        'advertisements',
        AdvMockResponse,
        null,
        advPut
      );
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/peeringrequests'
    ) {
      return responseManager(
        req,
        error,
        method,
        crd,
        'peeringrequests',
        PRMockResponse,
        null,
        null
      );
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/clusterconfigs'
    ) {
      return responseManager(
        req,
        error,
        method,
        crd,
        'clusterconfigs',
        ConfigMockResponse,
        null,
        ConfigMockResponseUpdated
      );
    } else if (req.url === 'http://localhost:3001/pod') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: PodsMockResponse }))
      );
    } else if (req.url === 'http://localhost:3001/nodes') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: NodesMockResponse }))
      );
    } else if (req.url === 'http://localhost:3001/metrics/nodes') {
      return Promise.resolve(
        new Response(JSON.stringify(NodesMetricsMockResponse))
      );
    } else if (req.url === 'http://localhost:3001/configmaps/liqo') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: CMMockResponse }))
      );
    } else if (alwaysPresentGET(req.url)) {
      return alwaysPresentGET(req.url);
    } else {
      return metricsPODs(req);
    }
  });
}

export const loginTest = async () => {
  setup_login();

  /** Input mock password */
  const tokenInput = await screen.findByLabelText('lab');
  await userEvent.type(tokenInput, token);

  /** Click on login button */
  const submitButton = screen.getByRole('button');

  userEvent.click(submitButton);

  /** Assert that the redirected page is the home page */
  expect(await screen.findByText('LIQO')).toBeInTheDocument();
};

export async function setup_resource(error, method, crd) {
  mockCRDAndViewsExtended(error, method, crd);
  setToken();
  window.history.pushState(
    {},
    'Page Title',
    '/customresources/liqodashtests.dashboard.liqo.io'
  );

  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByLabelText('plus')).toBeInTheDocument();
}

export async function setup_cv(view) {
  if (!view) {
    view = ViewMockResponse;
  }
  fetch.mockImplementation(url => {
    if (url === 'http://localhost:3001/customresourcedefinition') {
      return Promise.resolve(new Response(JSON.stringify(CRDmockResponse)));
    } else if (url === 'http://localhost:3001/clustercustomobject/views') {
      return Promise.resolve(new Response(JSON.stringify({ body: view })));
    } else if (
      url === 'http://localhost:3001/clustercustomobject/tunnelendpoints'
    ) {
      //return Promise.resolve(new Response(JSON.stringify({ body: TunnMockResponse })))
    } else if (
      url ===
      'http://localhost/apiserver/apis/net.liqo.io/v1alpha1/tunnelendpoints.liqonet.liqo.io'
    ) {
      //return Promise.resolve(new Response(JSON.stringify(TunnMockResponse)))
    } else if (alwaysPresentGET(url)) {
      return alwaysPresentGET(url);
    } else {
      return generalHomeGET(url);
    }
  });

  await loginTest();

  const customview = await screen.findByText('Liqo View');

  userEvent.click(customview);
}
