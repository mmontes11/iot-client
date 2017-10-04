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
        unit: {
            name: 'degrees',
            symbol: '°C'
        },
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
        unit: {
            name: 'degrees',
            symbol: '°C'
        },
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
        unit: {
            name: 'relative',
            symbol: '%'
        },
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
        unit:  {
            name: 'relative',
            symbol: '%'
        },
        value: 0.6
    },
    inValidMeasurement: {
        device: 'raspberry',
        relatedEntities: []
    },
    validMeasurementWithKind: {
        kind: 'measurement',
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
        unit: {
            name: 'degrees',
            symbol: '°C'
        },
        value: 10
    },
    invalidMeasurementWithKind: {
        kind: 'measurement',
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
        unit: {
            name: 'degrees',
            symbol: '°C'
        }
    },
    validMeasurementWithInvalidKind: {
        kind: 'foo',
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
        unit: {
            name: 'degrees',
            symbol: '°C'
        },
        value: 10
    },
    validEventWithKind: {
        kind: 'event',
        creator: {
            username: 'mmontes',
            device: 'raspberry'
        },
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
        type: 'window_opened',
        duration: {
            unit:  {
                name: 'seconds',
                symbol: 's'
            },
            value: 2.4
        }
    },
    invalidEventWithKind: {
        kind: 'event',
        creator: {
            username: 'mmontes',
            device: 'raspberry'
        },
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
        duration: {
            unit:  {
                name: 'seconds',
                symbol: 's'
            },
            value: 2.4
        }
    },
    validEventWithInvalidKind: {
        kind: 'bar',
        creator: {
            username: 'mmontes',
            device: 'raspberry'
        },
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
        type: 'window_opened',
        duration: {
            unit:  {
                name: 'seconds',
                symbol: 's'
            },
            value: 2.4
        }
    }
};