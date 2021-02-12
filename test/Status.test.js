import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import fetchMock from 'jest-fetch-mock';
import { act, render, screen } from '@testing-library/react';
import ViewMockResponse from '../__mocks__/views.json';
import ApiInterface from '../src/services/api/ApiInterface';
import { MemoryRouter } from 'react-router-dom';
import Home from '../src/views/liqo/Home';
import FCMockResponse from '../__mocks__/foreigncluster.json';
import PRMockResponse from '../__mocks__/peeringrequest.json';
import AdvMockResponse from '../__mocks__/advertisement.json';
import ConfigMockResponse from '../__mocks__/configs.json';
import CRDmockEmpty from '../__mocks__/crd_fetch.json';
import Error409 from '../__mocks__/409.json';
import NodesMockResponse from '../__mocks__/nodes.json';
import NodesMetricsMockResponse from '../__mocks__/nodes_metrics.json';
import PodsMockResponse from '../__mocks__/pods.json';
import LineChart from '../src/widgets/line/LineChart';
import { metricsPODs } from './RTLUtils';
import { testTimeout } from '../src/constants';
import CMMockResponse from '../__mocks__/configmap_clusterID.json';
import NamespaceResponse from '../__mocks__/namespaces.json';

fetchMock.enableMocks();

async function setup() {
  window.api = ApiInterface();
  window.api.getCRDs().then(async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  });
}

function mocks(
  advertisement,
  foreignCluster,
  peeringRequest,
  error,
  errorMetrics
) {
  fetch.mockResponse(req => {
    if (req.url === 'http://localhost:3001/customresourcedefinition') {
      return Promise.resolve(new Response(JSON.stringify(CRDmockEmpty)));
    } else if (req.url === 'http://localhost:3001/namespaces') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: NamespaceResponse }))
      );
    } else if (req.url === 'http://localhost:3001/clustercustomobject/views') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: ViewMockResponse }))
      );
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/foreignclusters'
    ) {
      return Promise.resolve(
        new Response(JSON.stringify({ body: foreignCluster }))
      );
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/advertisements'
    ) {
      return Promise.resolve(
        new Response(JSON.stringify({ body: advertisement }))
      );
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/peeringrequests'
    ) {
      return Promise.resolve(
        new Response(JSON.stringify({ body: peeringRequest }))
      );
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/clusterconfigs'
    ) {
      return Promise.resolve(
        new Response(JSON.stringify({ body: ConfigMockResponse }))
      );
    } else if (req.url === 'http://localhost:3001/nodes') {
      if (!error)
        return Promise.resolve(
          new Response(JSON.stringify({ body: NodesMockResponse }))
        );
      else return Promise.reject({ body: Error409 });
    } else if (req.url === 'http://localhost:3001/metrics/nodes') {
      if (!errorMetrics)
        return Promise.resolve(
          new Response(JSON.stringify(NodesMetricsMockResponse))
        );
      else return Promise.reject(404);
    } else if (req.url === 'http://localhost:3001/pod') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: PodsMockResponse }))
      );
    } else if (req.url === 'http://localhost:3001/configmaps/liqo') {
      return Promise.resolve(
        new Response(JSON.stringify({ body: CMMockResponse }))
      );
    } else {
      return metricsPODs(req);
    }
  });
}

async function OKCheck() {
  await setup();

  expect(await screen.findByText('Cluster-Test')).toBeInTheDocument();
  expect(
    await screen.findByText('No peer available at the moment')
  ).toBeInTheDocument();
  expect(await screen.findByText('Home')).toBeInTheDocument();
  expect(await screen.findByText(/Foreign/i)).toBeInTheDocument();

  expect(await screen.findAllByText('Consumption')).toHaveLength(2);
  expect(await screen.findAllByText('Consumption trend')).toHaveLength(2);
}

describe('Status', () => {
  test('General status information and update', async () => {
    mocks(AdvMockResponse, FCMockResponse, PRMockResponse);

    await OKCheck();

    await act(async () => {
      await new Promise(r => setTimeout(r, 31000));
    });
  }, 60000);

  test(
    '404 on node metrics',
    async () => {
      mocks(AdvMockResponse, FCMockResponse, PRMockResponse, false, true);

      await OKCheck();

      expect(
        await screen.findAllByLabelText('exclamation-circle')
      ).toHaveLength(2);
    },
    testTimeout
  );

  test(
    'Line chart NaN data',
    async () => {
      render(
        <MemoryRouter>
          <LineChart
            data={[
              { resource: 'CPU', date: '00:00:00', value: NaN },
              { resource: 'RAM', date: '00:00:00', value: NaN }
            ]}
          />
        </MemoryRouter>
      );
    },
    testTimeout
  );
});
