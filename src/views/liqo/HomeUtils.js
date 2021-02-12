import { message } from 'antd';
import React from 'react';
import { colorsBasic } from '../../services/Colors';

/** Return the right color from the percentage given */
export function getColor(percent, allocatable) {
  if (percent < 70) {
    return colorsBasic[allocatable];
  } else if (percent >= 70 && percent < 90) {
    return colorsBasic[31 + allocatable];
  } else if (percent >= 90) {
    return colorsBasic[33 + allocatable];
  }
}

/**
 * Search an advertisement from a pool of advertisements
 * @advertisements: the total of advertisements in the cluster
 * @advertisement: the foreign cluster's advertisement
 * @returns true if the advertisement exist and is Accepted, false if not
 * if false it also returns a reason why (the advertisement do not exists,
 * the advertisement is Refused or is not Accepted)
 */
export function checkAdvertisement(advertisements, advertisement) {
  let adv = advertisements.find(adv => {
    return adv.metadata.name === advertisement.name;
  });
  if (adv) {
    if (adv.status) {
      if (adv.status.advertisementStatus === 'Accepted') {
        return { adv: true };
      } else if (adv.status.advertisementStatus === 'Refused') {
        return { adv: false, reason: 'Advertisement Refused' };
      } else {
        return { adv: false, reason: 'Adv. not accepted yet' };
      }
    } else {
      return { adv: false, reason: 'Adv. status not defined' };
    }
  } else {
    return { adv: false, reason: 'Advertisement not present' };
  }
}

/**
 * For now Peering Requests are always accepted, so just check
 * if there is one
 */
export function checkPeeringRequest(peeringRequests, peeringRequest) {
  let pr = peeringRequests.find(pr => {
    return pr.metadata.name === peeringRequest.name;
  });

  if (pr) return true;
}

/** Updates the peering status: CR foreign cluster's joined true or false */
export function updatePeeringStatus(
  props,
  loading,
  setLoading,
  messageOK,
  messageError
) {
  let item = {
    spec: props.foreignCluster.spec
  };

  setLoading(prev => !prev);

  let foreignClusterCRD = window.api.getCRDFromKind('ForeignCluster');

  let promise = window.api.updateCustomResource(
    foreignClusterCRD.spec.group,
    foreignClusterCRD.spec.version,
    props.foreignCluster.metadata.namespace,
    foreignClusterCRD.spec.names.plural,
    props.foreignCluster.metadata.name,
    item
  );

  promise
    .then(() => {
      message.success(messageOK);
    })
    .catch(() => {
      message.error(messageError);
      setLoading(prev => !prev);
    });
}

export function addZero(i) {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

export function convertRAM(string) {
  let unit = string.slice(-2);

  if (unit === 'Ki') {
    return parseFloat(string) * Math.pow(10, 3);
  } else if (unit === 'Mi') {
    return parseFloat(string) * Math.pow(10, 6);
  } else if (unit === 'Gi') {
    return parseFloat(string) * Math.pow(10, 9);
  } else return parseFloat(string);
}

export function convertCPU(string) {
  let unit = string.slice(-1);
  if (unit === 'k') {
    return parseFloat(string) * Math.pow(10, 3);
  } else if (unit === 'm') {
    return parseFloat(string) * Math.pow(10, 6);
  } else if (unit === 'g') {
    return parseFloat(string) * Math.pow(10, 9);
  } else if (unit === 'n') {
    return parseFloat(string);
  } else return parseFloat(string) * Math.pow(10, 9);
}
