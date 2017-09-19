export default {
    validUser: {
        username: 'mmontes',
        password: 'aA12345678&'
    },
    invalidUser: {
        password: 'aA12345678&'
    },
    userWithWeakPassword: {
        username: 'testUser',
        password: '1234'
    },
    temperatureMeasurement: {
        device: 'raspberry',
        relatedEntities: [
            {
                name: 'Home',
                type: 'building',
                geometry: {
                    type: 'Point',
                    coordinates: [125.6, 10.1]
                }
            }
        ],
        type: 'temperature',
        units: 'degrees',
        value: 10
    },
    temperatureMeasurement2: {
        device: 'raspberry',
        relatedEntities: [
            {
                name: 'Home',
                type: 'building',
                geometry: {
                    type: 'Point',
                    coordinates: [125.6, 10.1]
                }
            }
        ],
        type: 'temperature',
        units: 'degrees',
        value: 15
    },
    humidityMeasurement: {
        device: 'raspberry',
        relatedEntities: [
            {
                name: 'Home',
                type: 'building',
                geometry: {
                    type: 'Point',
                    coordinates: [125.6, 10.1]
                }
            }
        ],
        type: 'humidity',
        units: 'relative',
        value: 0.3
    },
    humidityMeasurement2: {
        device: 'raspberry',
        relatedEntities: [
            {
                name: 'Home',
                type: 'building',
                geometry: {
                    type: 'Point',
                    coordinates: [125.6, 10.1]
                }
            }
        ],
        type: 'humidity',
        units: 'relative',
        value: 0.6
    },
    inValidMeasurement: {
        device: 'raspberry',
        relatedEntities: []
    }
};