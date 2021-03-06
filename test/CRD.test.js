import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import fetchMock from 'jest-fetch-mock';
import {
  alwaysPresentGET,
  generalHomeGET,
  loginTest,
  mockCRDAndViewsExtended,
  setToken
} from './RTLUtils';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CRDmockResponse from '../__mocks__/crd_fetch.json';
import ViewMockResponse from '../__mocks__/views.json';
import LiqoDashMockResponse from '../__mocks__/liqodashtest.json';
import LiqoDashModifiedMockResponse from '../__mocks__/liqodashtest_modifiedCRD.json';
import LiqoDashAlteredMockResponse from '../__mocks__/liqodashtest_noSpec_noStatus.json';
import PieMockResponse from '../__mocks__/piecharts.json';
import NoAnnNoResNoSch from '../__mocks__/no_Ann_noRes_noSch.json';
import ManyResources from '../__mocks__/manyResources.json';
import ApiInterface from '../src/services/api/ApiInterface';
import CRD from '../src/resources/CRD/CRD';
import { MemoryRouter } from 'react-router-dom';
import Error401 from '../__mocks__/401.json';
import Error409 from '../__mocks__/409.json';
import { testTimeout } from '../src/constants';
import { fireEvent } from '@testing-library/dom';
import Cookies from 'js-cookie';
import CRDmockLong from '../__mocks__/crd_fetch_long.json';
import SchedNodesMockResponse from '../__mocks__/schedulingnodes.json';
import GraphMockResponse from '../__mocks__/graph.json';
import App from '../src/app/App';

fetchMock.enableMocks();

async function setup(crd) {
  setToken();
  window.history.pushState({}, 'Page Title', crd);

  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
}

async function setup_extended() {
  fetch.mockResponse(req => {
    return mocks(req);
  });

  setToken();
  window.history.pushState(
    {},
    'Page Title',
    '/customresources/advertisements.protocol.liqo.io'
  );

  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
}

function mocks(req, error, template, noview) {
  if (req.url === 'http://localhost:3001/customresourcedefinition') {
    return Promise.resolve(new Response(JSON.stringify(CRDmockResponse)));
  } else if (req.url === 'http://localhost:3001/clustercustomobject/views') {
    if (req.method === 'GET')
      if (noview) {
        return Promise.resolve(
          new Response(JSON.stringify({ body: { items: [] } }))
        );
      } else {
        return Promise.resolve(
          new Response(JSON.stringify({ body: ViewMockResponse }))
        );
      }
    else if (req.method === 'PUT') {
      if (error) return Promise.reject(Error409.body);
      else return Promise.resolve(JSON.stringify({ body: {} }));
    } else if (req.method === 'POST') {
      if (error) return Promise.reject(Error401.body);
      else return Promise.resolve();
    }
  } else if (
    req.url === 'http://localhost:3001/clustercustomobject/liqodashtests'
  ) {
    if (req.method === 'DELETE') {
      return Promise.resolve(
        new Response(JSON.stringify(LiqoDashMockResponse.items[0]))
      );
    } else {
      return Promise.resolve(
        new Response(JSON.stringify({ body: LiqoDashMockResponse }))
      );
    }
  } else if (
    req.url === 'http://localhost:3001/clustercustomobject/piecharts'
  ) {
    if (error && template) return Promise.reject(Error401.body);
    else
      return Promise.resolve(
        new Response(JSON.stringify({ body: PieMockResponse }))
      );
  } else if (
    req.url === 'http://localhost:3001/clustercustomobject/noannnoresnoschemas'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: NoAnnNoResNoSch }))
    );
  } else if (
    req.url === 'http://localhost:3001/clustercustomobject/manyresources'
  ) {
    return Promise.resolve(
      new Response(JSON.stringify({ body: ManyResources }))
    );
  } else if (alwaysPresentGET(req.url)) {
    return alwaysPresentGET(req.url);
  } else {
    return generalHomeGET(req.url);
  }
}

beforeEach(() => {
  localStorage.setItem('theme', 'dark');
  Cookies.remove('token');
});

async function setup_only_CRD(error, template, noview) {
  fetch.mockResponse(req => {
    return mocks(req, error, template, noview);
  });

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
}

async function alwaysPresent(kind, descr) {
  expect(await screen.findByLabelText('crd')).toBeInTheDocument();
  expect(screen.getByText(kind)).toBeInTheDocument();
  expect(screen.getByText(descr)).toBeInTheDocument();
  expect(screen.getAllByLabelText('star')).toHaveLength(2);
  expect(screen.getByText('Annotations')).toBeInTheDocument();
  expect(screen.getAllByText('Resources')).toHaveLength(2);
  expect(screen.getByText('Schema')).toBeInTheDocument();
  expect(screen.getAllByLabelText('layout')).toHaveLength(2);
  expect(screen.getByLabelText('picture')).toBeInTheDocument();
  expect(screen.getByLabelText('plus')).toBeInTheDocument();
}

describe('CRD', () => {
  /*test('Favourite are updated accordingly', async () => {
    await setup_extended();

    expect(await screen.findByLabelText('crd')).toBeInTheDocument();

    const favCRD = screen.getAllByLabelText('star')[2];
    userEvent.click(favCRD);

    expect(await screen.findAllByText('Advertisement')).toHaveLength(2);

    userEvent.click(favCRD);

    expect(await screen.findByText('Advertisement')).toBeInTheDocument();
  }, testTimeout)*/

  test(
    'CRD card shows every general information in different cases',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/advertisements.protocol.liqo.io');

      await alwaysPresent('Advertisement', 'No description for this CRD');
      expect(await screen.findAllByRole('switch')).toHaveLength(1);
    },
    testTimeout
  );

  test(
    'CRD card shows every general information in different cases 2',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/liqodashtests.dashboard.liqo.io');
      /** This CRD contains a custom template and a description, so there has to be a switch and not the default description*/
      await alwaysPresent(
        'LiqoDashTest',
        'A test CRD for some implemetation on the liqo-dashboard'
      );
      expect(await screen.findAllByRole('switch')).toHaveLength(2);
    },
    testTimeout
  );

  test(
    'CRD watch unexpectedly aborted',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/advertisements.protocol.liqo.io');

      await alwaysPresent('Advertisement', 'No description for this CRD');

      let apiManager = window.api.apiManager.current;

      apiManager.sendAbortedConnectionSignal('advertisements');
    },
    testTimeout
  );

  test(
    'Annotations tab works',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/advertisements.protocol.liqo.io');

      expect(await screen.findByLabelText('crd')).toBeInTheDocument();

      let annotations = screen.getByText('Annotations');
      userEvent.click(annotations);

      expect(screen.getByLabelText('tag')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Annotations tab works 2',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/noannnoresnoschemas.test');
      await screen.findByText('NoAnnNoResNoSchema');

      expect(await screen.findByLabelText('crd')).toBeInTheDocument();

      let annotations = screen.getByText('Annotations');
      userEvent.click(annotations);

      expect(screen.getByText('No annotations'));
    },
    testTimeout
  );

  test(
    'Resources tab works',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/noannnoresnoschemas.test');

      await screen.findByText('NoAnnNoResNoSchema');

      expect(await screen.findByLabelText('crd')).toBeInTheDocument();

      expect(screen.getByText('No resources present'));

      expect(screen.queryByLabelText('pagination')).not.toBeInTheDocument();

      const customview = screen.getByText('Custom Resources');
      userEvent.click(customview);
    },
    testTimeout
  );

  test(
    'Annotations tab works 2',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/advertisements.protocol.liqo.io');

      expect(await screen.findByLabelText('crd')).toBeInTheDocument();
      expect(await screen.findByLabelText('cr')).toBeInTheDocument();
      expect(screen.queryByLabelText('pagination')).not.toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Annotations tab works 3',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/manyresources.test');

      await screen.findByText('ManyResource');

      expect(await screen.findByLabelText('crd')).toBeInTheDocument();
      expect(await screen.findAllByLabelText('cr')).toHaveLength(5);
      expect(screen.queryByLabelText('pagination')).toBeInTheDocument();
      userEvent.click(await screen.findByText('2'));
      expect(await screen.findAllByLabelText('cr')).toHaveLength(3);
      userEvent.click(await screen.findByText(/5/i));
      fireEvent.mouseOver(screen.getByText('10 / page'));
      fireEvent.click(screen.getByText('10 / page'));
      fireEvent.mouseOver(screen.getByText('5 / page'));
      fireEvent.click(screen.getByText('5 / page'));
    },
    testTimeout
  );

  test(
    'Schema tab works',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/noannnoresnoschemas.test');

      expect(await screen.findByLabelText('crd')).toBeInTheDocument();

      let schema = await screen.findByText('Schema');
      userEvent.click(schema);

      expect(screen.getByText('No schema for this CRD'));
    },
    testTimeout
  );

  test(
    'Schema tab works 2',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/advertisements.protocol.liqo.io');
      await screen.findByText('Advertisement');

      expect(await screen.findByLabelText('crd')).toBeInTheDocument();

      let schema = await screen.findByText('Schema');
      userEvent.click(schema);

      expect(await screen.findByLabelText('schema')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Edit design drawer opens',
    async () => {
      await setup_extended();

      expect(await screen.findByLabelText('crd')).toBeInTheDocument();

      const edit = screen.getByLabelText('picture');
      expect(edit).toBeInTheDocument();

      userEvent.click(edit);

      expect(await screen.findByText(/Customize the design for:/i));

      const close = screen.getAllByLabelText('close');
      userEvent.click(close[0]);
    },
    testTimeout
  );

  test(
    'New CR drawer opens',
    async () => {
      await setup_extended();

      expect(await screen.findByLabelText('crd')).toBeInTheDocument();

      const plus = screen.getByLabelText('plus');
      expect(plus).toBeInTheDocument();

      userEvent.click(plus);

      expect(await screen.findByText(/Create a new/i));

      const close = screen.getAllByLabelText('close');
      userEvent.click(close[0]);
    },
    testTimeout
  );

  test(
    'Templates are switched correctly',
    async () => {
      fetch.mockResponse(req => {
        return mocks(req);
      });

      await setup('/customresources/liqodashtests.dashboard.liqo.io');

      await screen.findByText('LiqoDashTest');

      /** This CRD contains a custom template and a description, so there has to be a switch and not the default description*/
      const switcher = await screen.findAllByRole('switch');
      expect(switcher[1]).toBeInTheDocument();

      userEvent.click(screen.getByText('test-1'));
      expect(await screen.findByLabelText('piechart')).toBeInTheDocument();

      userEvent.click(switcher[1]);
      userEvent.click(screen.getByText('Spec'));
      expect(await screen.findByLabelText('form_spec'));

      userEvent.click(screen.getByText('Status'));
      expect(await screen.findByLabelText('form_status'));

      userEvent.click(switcher[1]);
      userEvent.click(screen.getByText('test-1'));
      expect(await screen.findByLabelText('piechart')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'CR with no spec or status still works',
    async () => {
      fetch.mockImplementation(url => {
        if (url === 'http://localhost:3001/customresourcedefinition') {
          return Promise.resolve(new Response(JSON.stringify(CRDmockResponse)));
        } else if (url === 'http://localhost:3001/clustercustomobject/views') {
          return Promise.resolve(
            new Response(JSON.stringify({ body: ViewMockResponse }))
          );
        } else if (
          url === 'http://localhost:3001/clustercustomobject/liqodashtests'
        ) {
          return Promise.resolve(
            new Response(JSON.stringify({ body: LiqoDashAlteredMockResponse }))
          );
        } else if (
          url === 'http://localhost:3001/clustercustomobject/piecharts'
        ) {
          return Promise.resolve(
            new Response(JSON.stringify({ body: PieMockResponse }))
          );
        } else if (alwaysPresentGET(url)) {
          return alwaysPresentGET(url);
        } else {
          return generalHomeGET(url);
        }
      });

      await setup('/customresources/liqodashtests.dashboard.liqo.io');

      await screen.findByText('LiqoDashTest');

      /** This CRD contains a custom template and a description, so there has to be a switch and not the default description*/
      const switcher = await screen.findAllByRole('switch');
      expect(switcher[1]).toBeInTheDocument();
      userEvent.click(switcher[1]);

      userEvent.click(screen.getByText('test-1'));

      expect(screen.queryByText('Spec')).not.toBeInTheDocument();
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'CRD changes when external changes happen, modify',
    async () => {
      await setup_only_CRD();

      expect(await screen.findByText('LiqoDashTest')).toBeInTheDocument();

      window.api.CRDsNotifyEvent('MODIFIED', LiqoDashModifiedMockResponse);

      expect(await screen.findByText('LiqoDashTestMod')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'CR gets eliminated',
    async () => {
      await setup_only_CRD();

      expect(await screen.findByText('LiqoDashTest')).toBeInTheDocument();

      const deleted = screen.getAllByLabelText('delete');

      userEvent.click(deleted[0]);

      expect(await screen.findByText('Are you sure?')).toBeInTheDocument();

      let no = await screen.findByText('No');
      expect(no).toBeInTheDocument();

      let yes = await screen.findByText('Yes');
      expect(yes).toBeInTheDocument();

      userEvent.click(yes);

      userEvent.click(await screen.findByLabelText('delete'));

      no = await screen.findByText('No');
      expect(no).toBeInTheDocument();

      yes = await screen.findByText('Yes');
      expect(yes).toBeInTheDocument();

      userEvent.click(no);
    },
    testTimeout
  );

  test(
    'CRD template error',
    async () => {
      await setup_only_CRD(true, true);

      expect(await screen.queryByText('LiqoDashTest')).not.toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'CRD dropdown custom view',
    async () => {
      await setup_only_CRD();

      expect(await screen.findByText('LiqoDashTest')).toBeInTheDocument();

      let layout = await screen.findAllByLabelText('layout');

      userEvent.click(layout[1]);

      await act(async () => {
        let view = await screen.findAllByText('Liqo View');
        userEvent.click(view[1]);
      });

      layout = await screen.findAllByLabelText('layout');

      userEvent.click(layout[1]);

      await act(async () => {
        let view = await screen.findAllByText('Liqo View');
        userEvent.click(view[1]);
      });

      expect(await screen.findAllByText(/updated/i)).toHaveLength(1);
    },
    testTimeout
  );

  test(
    'CRD dropdown custom view failed add to custom view',
    async () => {
      await setup_only_CRD(true);

      expect(await screen.findByText('LiqoDashTest')).toBeInTheDocument();

      let layout = await screen.findAllByLabelText('layout');

      userEvent.click(layout[1]);

      let view = await screen.findAllByText('Liqo View');
      userEvent.click(view[1]);
    },
    testTimeout
  );

  test(
    'CRD dropdown custom view no custom view',
    async () => {
      await setup_only_CRD(false, false, true);

      expect(await screen.findByText('LiqoDashTest')).toBeInTheDocument();

      let layout = await screen.findAllByLabelText('layout');

      userEvent.click(layout[0]);

      expect(await screen.findByText('No custom views')).toBeInTheDocument();
    },
    testTimeout
  );

  /*test('CRD dropdown custom view new custom view', async () => {
    await setup_only_CRD(true);

    expect(await screen.findByText('LiqoDashTest')).toBeInTheDocument();

    let layout = await screen.findAllByLabelText('layout');

    userEvent.click(layout[1]);

    let newCV = await screen.findAllByText('New Custom View')
    userEvent.click(newCV[1]);

    expect(await screen.findAllByText('New Custom View')).toHaveLength(3);

    const name = await screen.findByRole('input');
    await userEvent.type(name, 'Test Custom View');
    const resources = await screen.findAllByLabelText('autocompletesearch');
    userEvent.click(resources[0]);
    const adv = await screen.findAllByText('configmaps');

    fireEvent.mouseOver(adv[0]);
    fireEvent.click(adv[0]);

    userEvent.click(await screen.findByText('OK'));

    expect(await screen.findByText('Could not create custom view'));
  }, testTimeout)*/

  test(
    'CRD change description',
    async () => {
      await setup_only_CRD();

      expect(await screen.findByText('LiqoDashTest')).toBeInTheDocument();
      userEvent.click(screen.getAllByLabelText('edit')[0]);

      await act(async () => {
        await userEvent.type(
          screen.getByText(
            'A test CRD for some implemetation on the liqo-dashboard'
          ),
          '2'
        );
        await userEvent.type(
          screen.getByText(
            /A test CRD for some implemetation on the liqo-dashboard2/i
          ),
          '{enter}'
        );
      });

      expect(
        await screen.findByText(
          /A test CRD for some implemetation on the liqo-dashboard2/i
        )
      ).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'CRD update but same resourceVersion',
    async () => {
      await setup_only_CRD(false, false, true);

      expect(await screen.findByText('LiqoDashTest')).toBeInTheDocument();

      let resources = await screen.findAllByText('Resources');
      userEvent.click(resources[1]);

      act(() => {
        window.api.apiManager.current.sendModifiedSignal(
          'liqodashtests',
          LiqoDashMockResponse.items[0]
        );
      });
    },
    testTimeout
  );

  test('CRD with multi-view', async () => {
    fetch.mockImplementation(url => {
      if (url === 'http://localhost:3001/customresourcedefinition') {
        return Promise.resolve(new Response(JSON.stringify(CRDmockLong)));
      } else if (url === 'http://localhost:3001/clustercustomobject/views') {
        return Promise.resolve(
          new Response(JSON.stringify({ body: ViewMockResponse }))
        );
      } else if (
        url === 'http://localhost:3001/clustercustomobject/schedulingnodes'
      ) {
        return Promise.resolve(
          new Response(JSON.stringify({ body: SchedNodesMockResponse }))
        );
      } else if (url === 'http://localhost:3001/clustercustomobject/graphs') {
        return Promise.resolve(
          new Response(JSON.stringify({ body: GraphMockResponse }))
        );
      }
    });

    window.api = ApiInterface({ id_token: 'test' });
    await window.api.getCRDs().then(async () => {
      let crd = await window.api.getCRDFromKind('SchedulingNode');

      render(
        <MemoryRouter>
          <CRD CRD={crd.metadata.name} showEditor={true} onCustomView={true} />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText('SchedulingNode')).toBeInTheDocument();
  });
});
