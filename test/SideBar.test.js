import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import fetchMock from 'jest-fetch-mock';
import {
  loginTest,
  mockCRDAndViewsExtended,
  setToken,
  setup_cv
} from './RTLUtils';
import userEvent from '@testing-library/user-event';
import { testTimeout } from '../src/constants';
import Cookies from 'js-cookie';
import ApiInterface from '../src/services/api/ApiInterface';
import DashboardConfig from '../__mocks__/dashboardconf.json';
import { MemoryRouter } from 'react-router-dom';
import AppHeader from '../src/common/AppHeader';
import SideBar from '../src/common/SideBar';

fetchMock.enableMocks();

beforeEach(() => {
  localStorage.setItem('theme', 'dark');
  Cookies.remove('token');
});

describe('Sidebar', () => {
  /*test('New Custom View works', async () => {
    mockCRDAndViewsExtended();
    await loginTest();

    userEvent.click(await screen.findByText('New Custom View'));

    expect(await screen.findAllByText('New Custom View')).toHaveLength(2);

    const name = await screen.findByRole('input');
    await userEvent.type(name, 'Test Custom View');
    let crds = await screen.findAllByLabelText('select');
    userEvent.click(crds[2]);
    const adv = await screen.findAllByText('advertisements.protocol.liqo.io');
    fireEvent.mouseOver(adv[1]);
    fireEvent.click(adv[1]);

    userEvent.click(await screen.findByText('OK'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 1000));
    })

    expect(await screen.findByText('Test Custom View')).toBeInTheDocument();
  }, testTimeout)*/

  test(
    'Sidebar main menus item and submenus item are showed',
    async () => {
      mockCRDAndViewsExtended();
      await loginTest();

      expect(await screen.findAllByText(/Home/i)).toHaveLength(2);

      expect(await screen.findByText(/custom resources/i)).toBeInTheDocument();

      //expect(await screen.findByText(/favourites/i)).toBeInTheDocument();

      expect(await screen.findByText(/settings/i)).toBeInTheDocument();

      expect(await screen.findByText('Liqo View')).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'Sidebar custom view redirect is ok',
    async () => {
      await setup_cv();
    },
    testTimeout
  );

  test(
    'Sidebar custom resource redirect is ok',
    async () => {
      mockCRDAndViewsExtended();
      await loginTest();

      const customview = await screen.findByText('Custom Resources');
      userEvent.click(customview);

      expect(await screen.findByText(/advertisement./i)).toBeInTheDocument();

      expect(await screen.findAllByRole('row')).toHaveLength(10);
    },
    testTimeout
  );

  test(
    'Sidebar collapse works',
    async () => {
      await setup_cv();

      await screen.findAllByRole('img');

      userEvent.click(await screen.findByLabelText('left'));

      expect(await screen.queryByLabelText('left')).not.toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'New Custom View with no name throws error',
    async () => {
      mockCRDAndViewsExtended();
      await loginTest();

      userEvent.click(await screen.findByText('New Custom View'));

      expect(await screen.findAllByText('New Custom View')).toHaveLength(2);

      userEvent.click(await screen.findByText('OK'));

      expect(await screen.findByText(/Please/i)).toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'New Custom View cancel',
    async () => {
      mockCRDAndViewsExtended();
      await loginTest();

      userEvent.click(await screen.findByText('New Custom View'));

      expect(await screen.findAllByText('New Custom View')).toHaveLength(2);

      userEvent.click(await screen.findByText('Cancel'));

      expect(
        await screen.queryByText('Test Custom View')
      ).not.toBeInTheDocument();
    },
    testTimeout
  );

  test(
    'DashboardConfig redirect to http site',
    async () => {
      window.api = ApiInterface({ id_token: 'test' });
      setToken();
      window.api.dashConfigs.current = DashboardConfig.items[0];
      window.less = {
        modifyVars: async () => {
          return Promise.resolve();
        }
      };

      render(
        <MemoryRouter>
          <SideBar />
        </MemoryRouter>
      );

      userEvent.click(await screen.findByLabelText('folder'));
    },
    testTimeout
  );
});
