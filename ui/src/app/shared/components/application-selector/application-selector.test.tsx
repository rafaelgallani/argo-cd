import {fireEvent, render, screen} from '@testing-library/react';
import {Form, FormApi} from 'argo-ui';
import * as React from 'react';

import * as models from '../../models';
import {ApplicationSelector, getSelectedApps} from './application-selector';

const app = (name: string): models.Application =>
    ({
        metadata: {name, namespace: 'argocd'},
        spec: {},
        status: {sync: {status: models.SyncStatuses.OutOfSync}, health: {status: models.HealthStatuses.Healthy}}
    }) as unknown as models.Application;

describe('ApplicationSelector', () => {
    let api: FormApi;
    const selector = (apps: models.Application[]) => <Form getApi={formApi => (api = formApi)}>{formApi => <ApplicationSelector apps={apps} formApi={formApi} />}</Form>;
    const checkbox = (name: string) => screen.getByRole('checkbox', {name: new RegExp(`^\\s*${name}\\b`)});
    const selectedNames = (apps: models.Application[]) => getSelectedApps(apps, api.getFormState().values).map(item => item.metadata.name);

    test('keeps the selection on the same app when an app is added above it', () => {
        const apps = ['app-a', 'app-b', 'app-c'].map(app);
        const {rerender} = render(selector(apps));
        fireEvent.click(checkbox('app-c'));

        const updatedApps = [app('app-0'), ...apps];
        rerender(selector(updatedApps));

        expect(checkbox('app-c')).toBeChecked();
        expect(checkbox('app-b')).not.toBeChecked();
        expect(selectedNames(updatedApps)).toEqual(['app-c']);
    });

    test('keeps the selection on the same app when an app above it leaves the list', () => {
        const [appA, appB, appC] = ['app-a', 'app-b', 'app-c'].map(app);
        const {rerender} = render(selector([appA, appB, appC]));
        fireEvent.click(checkbox('app-c'));

        rerender(selector([appA, appC]));

        expect(checkbox('app-c')).toBeChecked();
        expect(selectedNames([appA, appC])).toEqual(['app-c']);
    });
});
