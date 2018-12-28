class Element {
    
    addLayerData(chartInstance, data){
        this.isArray(data);

        data.map(items => {
            let update = chartInstance.data.datasets.filter(item => item._id === items._id) || [];

            // Update if the data collection already exists
            if(update.length) {
                this.updateLayerData(chartInstance, [items]);
                return;
            }

            let target = [];
            items.data.map((value, key) => {
                if (Object.prototype.toString.call(value) === "[object Object]") {
                    let index = chartInstance.data.labels.indexOf(value.x);
                    if (index > -1) target[index] = value.y;
                } else {
                    if(value !== undefined) target[key] = value;
                    else if(value === null) target[key] = null;
                    else target[key] = undefined;
                }
            });

            items.data = target;
            chartInstance.data.datasets.push(items);

        });
        chartInstance.update();
    }

    removeLayerData(chartInstance, data) {
        this.isArray(data);
        let update = [];
        data.map(item => {
            update.push({
                _id: item.id,
                data: [{
                    x: item.key,
                    y: null
                }]
            });
        });

        this.updateLayerData(chartInstance, update);
    }

    toggleLayer(chartInstance, id, status) {
        let index = 0;

        chartInstance.data.datasets.map((k,v) => {
            if(k._id === id) index = v;
        });

        if(typeof status !== 'boolean') status = !chartInstance.getDatasetMeta(index).hidden;

        chartInstance.getDatasetMeta(index).hidden = status;
        chartInstance.update();
    }

    getElement(chartInstance, event, callback) {
        let chartClickValue = chartInstance.getElementAtEvent(event)[0];
        let sourceData = chartInstance.config.data.datasets[chartClickValue._datasetIndex];
        let gasket = items.gasket || { data:[] };
        let meta = chartInstance.getDatasetMeta(chartClickValue._datasetIndex);
        let label = sourceData.data.filter(item => item._view === chartClickValue._view);
    
        return {
            id: sourceData._id,
            type: sourceData.type,
            label: sourceData.label,
            data: {
                value: sourceData.data[chartClickValue._index],
                source: chartClickValue,
                gasket: gasket.data[chartClickValue._index],
                index: chartClickValue._index
            },
            meta
        };
    }

    isArray(data){
        if (!Array.isArray(data)){
            console.error('param is not Array');
            return; 
        }
    }

    /**
     * update layer data
     * @param {Object} data - update data
     * @example [ { '_id': 1, 'data': [{'x': 2018-12-13, 'y': 80}] } ] - Single data update
     * 
     * @example [ { '_id': 1, 'data': [1,2,3,4,5,6] } ] - All data updates
     * @description In the update method, if the data of data is undefined, the single point update is ignored. If there is null, the single point data is erased.
     */ 
    updateLayerData(chartInstance, data) {
        this.isArray(data);

        try {
            data.map(items => {
                let target = chartInstance.data.datasets.filter(item => item._id === items._id)[0];

                if(!target) {
                    console.error('According to the configuration data did not match the data set');
                    return;
                }
                items.data.map((value, key) => {
                    if (Object.prototype.toString.call(value) === "[object Object]") {
                        let index = chartInstance.data.labels.indexOf(value.x);
                        if (index > -1) target.data[index] = value.y;
                    } else {
                        if(value !== undefined) target.data[key] = value;
                    }
                });
            });
            chartInstance.update();
        } catch (error) {
            console.error('The data format is incorrect and the update failed!', error);
        }
    }
};

export default new Element();