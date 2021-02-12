import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import fetchMock from 'jest-fetch-mock';
import { metricsPODs, mockCRDAndViewsExtended } from './RTLUtils';
import { act, render, screen } from '@testing-library/react';
import ApiInterface from '../src/services/api/ApiInterface';
import { MemoryRouter } from 'react-router-dom';
import Home from '../src/views/liqo/Home';
import CRDmockResponse from '../__mocks__/crd_fetch.json';
import FCMockResponse from '../__mocks__/foreigncluster.json';
import AdvMockResponse from '../__mocks__/advertisement.json';
import PRMockResponse from '../__mocks__/peeringrequest.json';
import Error404 from '../__mocks__/404.json';
import NodesMockResponse from '../__mocks__/nodes.json';
import NodesMetricsMockResponse from '../__mocks__/nodes_metrics.json';
import PodsMockResponse from '../__mocks__/pods.json';
import { testTimeout } from '../src/constants';
import CMMockResponse from '../__mocks__/configmap_clusterID.json';

fetchMock.enableMocks();

async function setup() {
  window.api = ApiInterface({ id_token: 'test' });
  window.api.getCRDs().then(async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  });
}

function mocks(error, noNodes) {
  fetch.mockImplementation(url => {
    if (url === 'http://localhost:3001/customresourcedefinition') {
      if (!error)
        return Promise.resolve(new Response(JSON.stringify(CRDmockResponse)));
      else {
        let CRDs = CRDmockResponse.items.filter(item => {
          return item.metadata.name !== 'clusterconfigs.policy.liqo.io';
        });
        return Promise.resolve(new Response(JSON.stringify({ items: CRDs })));
      }
    } else if (
      url === 'http://localhost:3001/clustercustomobject/foreignclusters'
    ) {
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
      url === 'http://localhost:3001/clustercustomobject/peeringrequests'
    ) {
      return Promise.resolve(
        new Response(JSON.stringify({ body: PRMockResponse }))
      );
    } else if (
      url === 'http://localhost:3001/clustercustomobject/clusterconfigs'
    ) {
      return Promise.reject(Error404.body);
    } else if (url === 'http://localhost:3001/nodes') {
      if (!noNodes)
        return Promise.resolve(
          new Response(JSON.stringify({ body: NodesMockResponse }))
        );
      else return Promise.reject();
    } else if (url === 'http://localhost:3001/metrics/nodes') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: NodesMetricsMockResponse }))
      );
    } else if (url === 'http://localhost:3001/pod') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: PodsMockResponse }))
      );
    } else if (url === 'http://localhost:3001/configmaps/liqo') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: CMMockResponse }))
      );
    } else {
      return metricsPODs({ url: url });
    }
  });
}

describe('Home', () => {
  test(
    'Foreign cluster updates',
    async () => {
      mockCRDAndViewsExtended(null, 'PUT', 'foreignclusters');

      await setup();

      expect(await screen.findByText('LIQO')).toBeInTheDocument();

      await act(async () => {
        await window.api.createCustomResource(
          null,
          null,
          null,
          'foreignclusters',
          null,
          null
        );
      });
    },
    testTimeout
  );

  test(
    'Advertisement updates',
    async () => {
      mockCRDAndViewsExtended(null, 'DELETE', 'advertisements');

      await setup();

      expect(await screen.findByText('LIQO')).toBeInTheDocument();

      await act(async () => {
        await window.api.deleteCustomResource(
          null,
          null,
          null,
          'advertisements',
          null
        );
      });
    },
    testTimeout
  );

  test(
    'Peering request updates',
    async () => {
      mockCRDAndViewsExtended(null, 'DELETE', 'peeringrequests');

      await setup();

      expect(await screen.findByText('LIQO')).toBeInTheDocument();

      await act(async () => {
        await window.api.deleteCustomResource(
          null,
          null,
          null,
          'peeringrequests',
          null
        );
      });
    },
    testTimeout
  );

  test(
    'Cluster config updates',
    async () => {
      mockCRDAndViewsExtended(null, 'DELETE', 'clusterconfigs');

      await setup();

      expect(await screen.findByText('LIQO')).toBeInTheDocument();

      await act(async () => {
        await window.api.updateCustomResource(
          null,
          null,
          null,
          'clusterconfigs',
          null
        );
      });
    },
    testTimeout
  );

  test(
    'Change CRD on home view',
    async () => {
      mockCRDAndViewsExtended(null, null, null, true);
      await setup();

      expect(await screen.findByText('LIQO')).toBeInTheDocument();

      await window.api.updateCustomResourceDefinition(
        null,
        api.getCRDFromKind('Advertisement')
      );

      await act(async () => {
        expect(await screen.findByText(/modified/i));
      });
    },
    testTimeout
  );

  test(
    'No Config CRD present',
    async () => {
      mocks(true);
      await setup();

      expect(await screen.findByText('LIQO')).toBeInTheDocument();
      expect(await screen.findByText('Not Installed')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Error on getting CR in home view',
    async () => {
      mocks();
      await setup();

      expect(await screen.findByText('LIQO')).toBeInTheDocument();
      expect(await screen.findByText('Not Installed')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Error on getting Nodes in home view',
    async () => {
      mocks(false, true);
      await setup();

      expect(await screen.queryByText('LIQO')).not.toBeInTheDocument();
    },
    testTimeout
  );
});
