import { message } from 'antd';

export function resourceNotifyEvent(func, type, object){
  if(object.metadata.namespace && object.metadata.namespace !== window.api.namespace.current && window.api.namespace.current)
    return;

  func(prev => {
    let resource = prev.find((item) => {
      return item.metadata.name === object.metadata.name;
    });

    if(type === 'MODIFIED' || type === 'ADDED') {
      if(resource) {
        if(resource.metadata.resourceVersion !== object.metadata.resourceVersion){
          prev = prev.filter(item => item.metadata.name !== object.metadata.name);
          prev.push(object);
          prev.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
          message.success(object.kind + ' ' + object.metadata.name + ' modified');
          return [...prev];
        }
      } else {
        prev.push(object);
        prev.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
        message.success(object.kind + ' ' + object.metadata.name + ' added');
        return [...prev];
      }
    } else if (type === 'DELETED') {
      if(resource){
        prev = prev.filter(item => item.metadata.name !== resource.metadata.name);
        message.success(object.kind + ' ' + object.metadata.name + ' deleted');
        return [...prev];
      }
    }

    return prev;
  });
}

export function getNamespaced(path){
  return window.api.getGenericResource(path)
    .then(res => {
      let link = res.metadata.selfLink.split('/').slice(0, -1).join('/');
      let resource = res.metadata.selfLink.split('/').slice(-1)[0];
      return window.api.getGenericResource(link)
        .then(res => {
          return {
            namespaced: res.resources.find(item => {
              return item.name === resource;
            }).namespaced
          }
        })
    }).catch(error => console.log(error));
}