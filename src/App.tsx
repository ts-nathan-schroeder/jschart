import './App.css';
import { getChartContext, ChartModel, ChartConfig, ColumnType, CustomChartContext, Query } from '@thoughtspot/ts-chart-sdk';
import React from 'react';
import _ from 'lodash';


(async () => {
    const ctx = await getChartContext({
        getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
            const cols = chartModel.columns;

            const measureColumns = _.filter(cols, (col) => col.type === ColumnType.MEASURE);

            const attributeColumns = _.filter(cols, (col) => col.type === ColumnType.ATTRIBUTE);

            const axisConfig: ChartConfig = {
                key: 'default',
                dimensions: [
                    {
                        key: 'x',
                        columns: [attributeColumns[0]],
                    },
                    {
                        key: 'y',
                        columns: measureColumns.slice(0, 2),
                    },
                ],
            };
            return [axisConfig];
        },
        getQueriesFromChartConfig: (
            chartConfig: ChartConfig[],
        ): Array<Query> => chartConfig.map((config: ChartConfig): Query => _.reduce(
            config.dimensions,
            (acc: Query, dimension) => ({
                queryColumns: [...acc.queryColumns, ...dimension.columns],
            }),
            {
                queryColumns: [],
            } as Query,
        )),
        renderChart: (ctx) => renderChart(ctx),
    });

    renderChart(ctx);
})();

function App() {
  return (
    <div className="App">
      High
    </div>
  );
}

export default App;
function renderChart(ctx: CustomChartContext): Promise<void> {
    throw new Error('Function not implemented.');
}

