const INCLUSIVE = require("scion-core");
const inclusive_gateway = new INCLUSIVE.Statechart(
    {
        id: 'TEST',
        states: [
            {
                id: 'Fork',
                onExit: () => {
                    console.log("\tExiting 'Fork'... ");
                },
                $type: 'parallel',
                states: [
                    {
                        states: [
                            {
                                id: 'T1@T1',
                                transitions: [
                                    {
                                        event: 'c1',
                                        target: 'T1'
                                    }
                                ]
                            },
                            {
                                id: 'T1',
                                transitions: [
                                    /**
                                     * Big danger: scion.js fires the first conflicting transition.
                                     * So, order of transitions is *CRUCIAL*!
                                     */
                                    {
                                        cond: (event: any): boolean => {
                                            return inclusive_gateway.isIn('T2@T2') && inclusive_gateway.isIn('T3@T3');
                                        },
                                        event: 'a',
                                        target: 'Join'
                                    },
                                    { // Default behavior:
                                        event: 'a',
                                        target: 'T1@T1'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        states: [
                            {
                                id: 'T2@T2',
                                transitions: [
                                    {
                                        event: 'c2',
                                        target: 'T2'
                                    }
                                ]
                            },
                            {
                                id: "T2",
                                transitions: [
                                    {
                                        cond: (event: any): boolean => {
                                            return inclusive_gateway.isIn('T1@T1') && inclusive_gateway.isIn('T3@T3');
                                        },
                                        event: 'b',
                                        target: 'Join'
                                    },
                                    {
                                        event: 'b',
                                        target: 'T2@T2'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        states: [
                            {
                                id: 'T3@T3',
                                transitions: [
                                    {
                                        event: 'c3',
                                        target: 'T3'
                                    }
                                ]
                            },
                            {
                                id: "T3",
                                transitions: [
                                    {
                                        cond: (event: any): boolean => {
                                            return inclusive_gateway.isIn('T1@T1') && inclusive_gateway.isIn('T2@T2');
                                        },
                                        event: 'c',
                                        target: 'Join'
                                    },
                                    {
                                        event: 'c',
                                        target: 'T3@T3'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'Join',
                onEntry: () => {
                    console.log("\tEntering 'Join'...");
                }
            }
        ]
    }
);

inclusive_gateway.start();
console.log('Initial: ' + inclusive_gateway.getConfiguration()); // "T3@T3,T2@T2,T1@T1"

inclusive_gateway.gen('c1');
console.log("'c1' sent: " + inclusive_gateway.getConfiguration()); // "T3@T3,T2@T2,T1"
inclusive_gateway.gen('c2');
console.log("'c2' sent: " + inclusive_gateway.getConfiguration()); // "T3@T3,T1,T2"

inclusive_gateway.gen('a');
console.log("'a' sent: " + inclusive_gateway.getConfiguration()); // "T3@T3,T1,T2@T2"
inclusive_gateway.gen('c');
console.log("'c' sent: " + inclusive_gateway.getConfiguration()); // No effect...
inclusive_gateway.gen('b');
console.log("'b' sent: " + inclusive_gateway.getConfiguration()); // "Join"



