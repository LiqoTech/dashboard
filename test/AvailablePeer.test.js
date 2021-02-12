import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import fetchMock from 'jest-fetch-mock';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewMockResponse from '../__mocks__/views.json';
import ApiInterface from '../src/services/api/ApiInterface';
import { MemoryRouter } from 'react-router-dom';
import Home from '../src/views/liqo/Home';
import FCMockResponse from '../__mocks__/foreigncluster_noJoin.json';
import FCMockResponseJoin from '../__mocks__/foreigncluster.json';
import FCMockResponseNoIn from '../__mocks__/foreigncluster_noIncoming.json';
import PRMockResponse from '../__mocks__/peeringrequest.json';
import AdvMockResponse from '../__mocks__/advertisement.json';
import SDMockResponse from '../__mocks__/searchdomain.json';
import AdvMockResponseRefused from '../__mocks__/advertisement_refused.json';
import AdvMockResponseNotAccepted from '../__mocks__/advertisement_notAccepted.json';
import ConfigMockResponse from '../__mocks__/configs.json';
import CRDmockEmpty from '../__mocks__/crd_fetch.json';
import Error409 from '../__mocks__/409.json';
import PodsMockResponse from '../__mocks__/pods.json';
import NodesMockResponse from '../__mocks__/nodes.json';
import NodesMetricsMockResponse from '../__mocks__/nodes_metrics.json';
import { metricsPODs } from './RTLUtils';
import { testTimeout } from '../src/constants';
import CMMockResponse from '../__mocks__/configmap_clusterID.json';
import NamespaceResponse from '../__mocks__/namespaces.json';

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

function mocks(advertisement, foreignCluster, peeringRequest, error) {
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
      if (req.method === 'GET')
        return Promise.resolve(
          new Response(JSON.stringify({ body: foreignCluster }))
        );
      else {
        if (!error) {
          let foreignCluster = FCMockResponseNoIn.items[0];
          foreignCluster.metadata.resourceVersion++;
          return Promise.resolve(
            new Response(JSON.stringify({ body: foreignCluster }))
          );
        } else {
          return Promise.reject(Error409.body);
        }
      }
    } else if (
      req.url === 'http://localhost:3001/clustercustomobject/searchdomains'
    ) {
      if (req.method === 'GET')
        return Promise.resolve(
          new Response(JSON.stringify({ body: SDMockResponse }))
        );
      else {
        if (!error) {
          let searchDomain = SDMockResponse.items[0];
          searchDomain.metadata.resourceVersion++;
          return Promise.resolve(
            new Response(JSON.stringify({ body: searchDomain }))
          );
        } else {
          return Promise.reject(Error409.body);
        }
      }
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
    } else {
      return metricsPODs(req);
    }
  });
}

async function OKCheck() {
  await setup();

  expect(await screen.findByText('Cluster-Test')).toBeInTheDocument();
  expect(
    await screen.findByText('No peer connected at the moment')
  ).toBeInTheDocument();
}

async function addPeer() {
  userEvent.click(screen.getByLabelText('plus'));

  let textbox = await screen.findAllByRole('textbox');

  await userEvent.type(textbox[0], 'test');
  await userEvent.type(textbox[1], 'domain-test');

  userEvent.click(screen.getByRole('switch'));

  expect(screen.getByText('Submit')).toBeInTheDocument();

  userEvent.click(screen.getByText('Submit'));
}

describe('AvailablePeer', () => {
  test(
    'List of available peers shows',
    async () => {
      mocks(AdvMockResponse, FCMockResponse, PRMockResponse);

      await OKCheck();

      userEvent.click(screen.getByLabelText('dropdown-available'));
    },
    testTimeout
  );

  test(
    'List of available peers shows (with refused adv)',
    async () => {
      mocks(AdvMockResponseRefused, FCMockResponseJoin, { items: [] });

      await OKCheck();

      userEvent.click(screen.getByLabelText('dropdown-available'));
    },
    testTimeout
  );

  test(
    'Add manual peer works',
    async () => {
      mocks(AdvMockResponse, FCMockResponse, PRMockResponse);

      await OKCheck();

      await addPeer();

      expect(await screen.findByText(/Peer Added/i)).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Add manual peer with error shows notification',
    async () => {
      mocks(AdvMockResponse, FCMockResponse, PRMockResponse, true);

      await OKCheck();

      await addPeer();

      expect(
        await screen.findByText(/Could not add peer/i)
      ).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Modal opens when click on search for domain',
    async () => {
      mocks(AdvMockResponse, FCMockResponseJoin, PRMockResponse);
      await setup();

      expect(await screen.findByText('Cluster-Test')).toBeInTheDocument();
      expect(await screen.findByText(/No peer available/i)).toBeInTheDocument();

      userEvent.click(await screen.findByText(/search/i));
    },
    testTimeout
  );

  test(
    'Connect with a cluster',
    async () => {
      mocks(AdvMockResponse, FCMockResponse, PRMockResponse);
      await OKCheck();

      userEvent.click(screen.getByText('Cluster-Test'));

      expect(await screen.findByText('Connect')).toBeInTheDocument();

      userEvent.click(screen.getByText('Connect'));

      expect(await screen.findByText(/No peer available/i)).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Connect with a cluster from dropdown',
    async () => {
      mocks(AdvMockResponse, FCMockResponse, PRMockResponse);
      await OKCheck();

      userEvent.click(screen.getByLabelText('ellipsis'));

      await act(async () => {
        userEvent.click(await screen.findByLabelText('link'));
      });

      expect(await screen.findByText(/No peer available/i)).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Connect through WAN',
    async () => {
      let fcRes = FCMockResponse;
      fcRes.items[0].spec.discoveryType = 'WAN';

      mocks(AdvMockResponse, fcRes, PRMockResponse);
      await OKCheck();

      userEvent.click(screen.getByLabelText('cluster'));

      expect(await screen.findByText(/No peer available/i)).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Connect with a cluster then disconnect',
    async () => {
      mocks(AdvMockResponseNotAccepted, FCMockResponse, PRMockResponse);
      await OKCheck();

      userEvent.click(screen.getByText('Cluster-Test'));

      expect(await screen.findByText('Connect')).toBeInTheDocument();

      userEvent.click(screen.getByText('Connect'));

      expect(await screen.findByText(/No peer connected/i)).toBeInTheDocument();

      userEvent.click(await screen.findByText('Stop Connecting'));

      expect(await screen.findByText('Connect')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Connect with a cluster then disconnect from dropdown',
    async () => {
      mocks(AdvMockResponseNotAccepted, FCMockResponse, PRMockResponse);
      await OKCheck();

      userEvent.click(screen.getByLabelText('ellipsis'));

      await act(async () => {
        userEvent.click(await screen.findByLabelText('link'));
      });

      userEvent.click(screen.getByLabelText('ellipsis'));

      await act(async () => {
        userEvent.click(await screen.findByLabelText('link'));
      });
    },
    testTimeout
  );

  test(
    'Connect with a cluster with error',
    async () => {
      mocks(AdvMockResponse, FCMockResponse, PRMockResponse, true);
      await OKCheck();

      userEvent.click(screen.getAllByText('Cluster-Test')[0]);

      expect(await screen.findByText('Connect')).toBeInTheDocument();

      userEvent.click(screen.getByText('Connect'));

      expect(await screen.findByText(/No peer connected/i)).toBeInTheDocument();

      userEvent.click(screen.getAllByText('Cluster-Test')[0]);
    },
    testTimeout
  );
});
