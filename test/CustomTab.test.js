import React from 'react';
import _ from 'lodash';
import '@testing-library/jest-dom/extend-expect';
import fetchMock from 'jest-fetch-mock';
import { generalMocks, setToken } from './RTLUtils';
import {
  act,
  findByText,
  fireEvent,
  render,
  screen
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/app/App';
import { testTimeout } from '../src/constants';
import Cookies from 'js-cookie';
import DashboardConfig from '../__mocks__/dashboardconf_2.json';
import userEvent from '@testing-library/user-event';
import DeploymentMock from '../__mocks__/deployments.json';

fetchMock.enableMocks();

async function setup() {
  setToken();
  window.history.pushState(
    {},
    'Page Title',
    '/api/v1/namespaces/test/pods/hello-world-deployment-6756549f5-x66v9'
  );

  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.setItem('theme', 'dark');
  if (window.api && !_.isEmpty(window.api.dashConfigs.current)) {
    window.api.dashConfigs.current = {};
  }
  Cookies.remove('token');
});

function mocks(error) {
  fetch.mockResponse(req => {
    if (
      req.url === 'http://localhost:3001/clustercustomobject/dashboardconfigs'
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
    } else if (generalMocks(req.url)) return generalMocks(req.url);
  });
}

describe('CustomTabs', () => {
  test(
    'CustomTabs change tab name, add tab and remove tab works',
    async () => {
      mocks();

      await setup();

      expect(await screen.findByText('pods')).toBeInTheDocument();
      expect(
        await screen.findByText('hello-world-deployment-6756549f5-x66v9')
      ).toBeInTheDocument();
      expect(await screen.findByText('NewTab')).toBeInTheDocument();

      userEvent.click(await screen.findByText('NewTab'));

      expect(await screen.findByText('Deployments')).toBeInTheDocument();
      expect(
        await screen.findByText('hello-world-deployment')
      ).toBeInTheDocument();
      expect(await screen.findByText('Containers')).toBeInTheDocument();

      userEvent.dblClick(await screen.findByText('NewTab'));
      userEvent.click(await screen.findByRole('input'));
      await act(async () => {
        await userEvent.type(await screen.findByRole('input'), '2{enter}');
      });

      expect(await screen.findByText('NewTab2')).toBeInTheDocument();

      let plus = await screen.findAllByLabelText('plus');

      userEvent.click(plus[2]);
      expect(await screen.findByText('NewTab')).toBeInTheDocument();

      let close = await screen.findAllByLabelText('close');

      await act(async () => {
        userEvent.click(close[4]);
      });

      expect(await screen.queryByText('NewTab')).not.toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Add list, add parameter, delete parameter',
    async () => {
      mocks();

      await setup();

      expect(
        await screen.findByText('hello-world-deployment-6756549f5-x66v9')
      ).toBeInTheDocument();
      expect(await screen.findByText('NewTab')).toBeInTheDocument();

      userEvent.click(await screen.findByText('NewTab'));

      expect(await screen.findByText('Deployments')).toBeInTheDocument();

      await act(async () => {
        fireEvent.contextMenu(screen.getByText('Deployments'));
      });
      const add = await screen.findByText('Add List');

      await act(async () => {
        await fireEvent.mouseOver(add);
        await fireEvent.click(add);
        await new Promise(r => setTimeout(r, 500));
      });

      expect(screen.findByText(/new list/i));

      await new Promise(r => setTimeout(r, 500));

      let select = await screen.findAllByLabelText('select-k8s');
      await act(async () => {
        userEvent.click(select[1]);
        await userEvent.type(select[1], 'resourcev');
        await new Promise(r => setTimeout(r, 500));
      });

      let resourceVersion = await screen.findAllByText('resourceVersion');

      fireEvent.mouseOver(resourceVersion[0]);
      await act(async () => {
        fireEvent.click(resourceVersion[0]);
        await new Promise(r => setTimeout(r, 500));
      });

      expect(await screen.findByText('Resource Version')).toBeInTheDocument();

      let edit = await screen.findAllByLabelText('edit');

      await act(async () => {
        userEvent.click(edit[2]);
        await new Promise(r => setTimeout(r, 500));
      });

      let del = await screen.findAllByLabelText('delete');

      await act(async () => {
        userEvent.click(del[1]);
        await new Promise(r => setTimeout(r, 500));
      });

      expect(
        await screen.queryByText('Resource Version')
      ).not.toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Add table',
    async () => {
      mocks();

      await setup();

      expect(
        await screen.findByText('hello-world-deployment-6756549f5-x66v9')
      ).toBeInTheDocument();
      expect(await screen.findByText('NewTab')).toBeInTheDocument();

      userEvent.click(await screen.findByText('NewTab'));

      expect(await screen.findByText('Deployments')).toBeInTheDocument();

      let close = await screen.findAllByLabelText('close');

      await act(async () => {
        userEvent.click(close[5]);
        await new Promise(r => setTimeout(r, 500));
      });

      await act(async () => {
        fireEvent.contextMenu(screen.getByText('Deployments'));
      });
      const add = await screen.findByText('Add Table');

      await act(async () => {
        await fireEvent.mouseOver(add);
        await fireEvent.click(add);
        await new Promise(r => setTimeout(r, 500));
      });

      expect(screen.findByText(/new table/i));

      await new Promise(r => setTimeout(r, 500));

      await act(async () => {
        let select = await screen.findAllByLabelText('select-k8s');
        userEvent.click(select[1]);
        await userEvent.type(select[1], 'container');
        await new Promise(r => setTimeout(r, 500));
      });

      let containers = await screen.findAllByText('containers');

      fireEvent.mouseOver(containers[0]);
      await act(async () => {
        fireEvent.click(containers[0]);
        await new Promise(r => setTimeout(r, 500));
      });

      expect(await screen.findByText('image')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Add deployment',
    async () => {
      mocks();

      await setup();

      expect(await screen.findByText('pods')).toBeInTheDocument();
      expect(
        await screen.findByText('hello-world-deployment-6756549f5-x66v9')
      ).toBeInTheDocument();
      expect(await screen.findByText('NewTab')).toBeInTheDocument();

      userEvent.click(await screen.findByText('NewTab'));

      expect(await screen.findByText('Deployments')).toBeInTheDocument();

      let deployment = DeploymentMock.items[0];

      window.api.apiManager.current.sendAddedSignal('deployments', deployment);
    },
    testTimeout
  );

  test(
    'Add new tab when resource not yet in configuration',
    async () => {
      fetch.mockResponse(req => {
        if (generalMocks(req.url)) return generalMocks(req.url);
      });

      await setup();

      expect(await screen.findByText('pods')).toBeInTheDocument();
      expect(
        await screen.findByText('hello-world-deployment-6756549f5-x66v9')
      ).toBeInTheDocument();

      let plus = await screen.findAllByLabelText('plus');

      userEvent.click(plus[1]);
      expect(await screen.findByText('NewTab')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'CustomTabs change tab name with blur',
    async () => {
      mocks();

      await setup();

      expect(await screen.findByText('pods')).toBeInTheDocument();
      expect(
        await screen.findByText('hello-world-deployment-6756549f5-x66v9')
      ).toBeInTheDocument();
      expect(await screen.findByText('NewTab')).toBeInTheDocument();

      userEvent.click(await screen.findByText('NewTab'));

      expect(await screen.findByText('Deployments')).toBeInTheDocument();
      expect(
        await screen.findByText('hello-world-deployment')
      ).toBeInTheDocument();
      expect(await screen.findByText('Containers')).toBeInTheDocument();

      userEvent.dblClick(await screen.findByText('NewTab'));
      userEvent.click(await screen.findByRole('input'));
      await act(async () => {
        await userEvent.type(await screen.findByRole('input'), '2');
        userEvent.click(await screen.findByText('Containers'));
      });

      expect(await screen.findByText('NewTab2')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'CustomTabs change tab name with the same name',
    async () => {
      mocks();

      await setup();

      expect(await screen.findByText('pods')).toBeInTheDocument();
      expect(
        await screen.findByText('hello-world-deployment-6756549f5-x66v9')
      ).toBeInTheDocument();
      expect(await screen.findByText('NewTab')).toBeInTheDocument();

      userEvent.click(await screen.findByText('NewTab'));

      expect(await screen.findByText('Deployments')).toBeInTheDocument();
      expect(
        await screen.findByText('hello-world-deployment')
      ).toBeInTheDocument();
      expect(await screen.findByText('Containers')).toBeInTheDocument();

      userEvent.dblClick(await screen.findByText('NewTab'));
      userEvent.click(await screen.findByRole('input'));
      await act(async () => {
        userEvent.click(await screen.findByText('Containers'));
      });

      expect(await screen.findByText('NewTab')).toBeInTheDocument();
    },
    testTimeout
  );
});
