import * as React from 'react';
import {Checkbox, FormFunctionProps} from 'argo-ui';
import * as models from '../../models';
import {appInstanceName, appQualifiedName, ComparisonStatusIcon, HealthStatusIcon, OperationPhaseIcon} from '../app-utils';
import {AuthSettingsCtx} from '../../context';

// Selection is stored by app instance name, not list position, so it survives list updates while the panel is open.
const SELECTED_APPS_FIELD = 'selectedApps';

export function getSelectedApps<T extends models.AbstractApplication>(apps: T[], formValues: any): T[] {
    const selected = new Set<string>(formValues[SELECTED_APPS_FIELD] || []);
    return apps.filter(app => selected.has(appInstanceName(app)));
}

export const ApplicationSelector = ({apps, formApi}: {apps: models.Application[]; formApi: FormFunctionProps}) => {
    const useAuthSettingsCtx = React.useContext(AuthSettingsCtx);
    const selected = new Set<string>(formApi.values[SELECTED_APPS_FIELD] || []);
    const setSelected = (names: string[]) => formApi.setValue(SELECTED_APPS_FIELD, names);
    const toggle = (name: string, checked: boolean) => setSelected(checked ? [...selected, name] : [...selected].filter(item => item !== name));
    return (
        <>
            <label>
                Apps (<a onClick={() => setSelected(apps.map(appInstanceName))}>all</a>/
                <a onClick={() => setSelected(apps.filter(app => app.status.sync.status === models.SyncStatuses.OutOfSync).map(appInstanceName))}>out of sync</a>/
                <a onClick={() => setSelected([])}>none</a>
                ):
            </label>
            <div style={{marginTop: '0.4em'}}>
                {apps.map(app => {
                    const name = appInstanceName(app);
                    return (
                        <label key={name} style={{marginTop: '0.5em', cursor: 'pointer'}}>
                            <Checkbox checked={selected.has(name)} onChange={checked => toggle(name, checked)} />
                            &nbsp;
                            {app.isAppOfAppsPattern
                                ? `(App of Apps) ${appQualifiedName(app, useAuthSettingsCtx?.appsInAnyNamespaceEnabled)}`
                                : appQualifiedName(app, useAuthSettingsCtx?.appsInAnyNamespaceEnabled)}
                            &nbsp;
                            <ComparisonStatusIcon status={app.status.sync.status} />
                            &nbsp;
                            <HealthStatusIcon state={app.status.health} />
                            &nbsp;
                            <OperationPhaseIcon app={app} />
                            <br />
                        </label>
                    );
                })}
            </div>
        </>
    );
};
