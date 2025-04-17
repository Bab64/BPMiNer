const A_2_1 = require("scion-core");
const a_2_1 = new A_2_1.Statechart(
    {
        id: 'TEST',
        states: [
            {
                id: 'Fork',
                $type: 'parallel',
                states: [
                    {
                        id: 'RIP1',
                        states: [
                            {
                                id: 'Task 2@Task 2',
                                transitions: [
                                    {
                                        event: 'Default',
                                        target: 'Task 2'
                                    }
                                ]
                            },
                            {
                                id: 'Task 2',
                                transitions: [
                                    {
                                        event: '2_1',
                                        target: 'End Event'
                                    }
                                ]
                            }
                        ]
                    },



                    {
                        id: 'RIP2',
                        states: [
                            {
                                id: 'Task 2@Task 2',
                                transitions: [
                                    {
                                        event: 'Default',
                                        target: 'Task 2'
                                    }
                                ]
                            },
                            {
                                id: 'Task 2',
                                transitions: [
                                    /**
                                     * Big danger: scion.js fires the first conflicting transition.
                                     * So, order of transitions is *CRUCIAL*!
                                     */
                                    {
                                        cond: (event: any): boolean => {
                                            return a_2_1.isIn('T2@T2') && a_2_1.isIn('T3@T3');
                                        },
                                        event: 'Condition',
                                        target: 'Gateway (Merge Flows)'
                                    },
                                    { // Default behavior:
                                        event: 'Condition',
                                        target: 'Task 2@Task 2'
                                    },
                                    {
                                        event: 'Default',
                                        target: 'Task 3'
                                    }
                                ]
                            },
                            {
                                id: 'Task 3',
                                transitions: [
                                    {
                                        event: 'Default',
                                        target: 'Task 2'
                                    }
                                ]
                            },
                        ]
                    },






                    {
                        id: 'RIP3',
                        states: [
                            {
                                id: 'Task 3bis@Task 3bis',
                                transitions: [
                                    {
                                        event: '3_1',
                                        target: 'Task 3bis'
                                    }
                                ]
                            },
                            {
                                id: 'Task 3bis',
                                transitions: [
                                    {
                                        cond: (event: any): boolean => {
                                            return true;//a_2_1.isIn('T2@T2') && a_2_1.isIn('T3@T3');
                                        },
                                        event: '3_2',
                                        target: 'Gateway (Merge Flows)'
                                    },
                                    { // Default behavior:
                                        event: '3_2',
                                        target: 'Task 3bis@Task 3bis'
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
                                            return a_2_1.isIn('Task 2@Task 2') && a_2_1.isIn('T3@T3');
                                        },
                                        event: 'b',
                                        target: 'Gateway (Merge Flows)'
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
                                            return a_2_1.isIn('Task 2@Task 2') && a_2_1.isIn('T2@T2');
                                        },
                                        event: 'c',
                                        target: 'Gateway (Merge Flows)'
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
                id: 'Gateway (Merge Flows)',
                onEntry: () => {
                    console.log("\tEntering 'Gateway (Merge Flows)'...");
                },
                transitions: [
                    {
                        event: 'end',
                        target: 'End Event'
                    }
                ]

            },
            {
                id: 'End Event',
                onEntry: () => {
                    console.log("\tEntering 'End Event'...");
                }
            }
        ]
    }
);

a_2_1.start();
console.log('Initial: ' + a_2_1.getConfiguration()); // "T3@T3,T2@T2,Task 2@Task 2"

a_2_1.gen('Default');
console.log("'Default' sent: " + a_2_1.getConfiguration()); // "T3@T3,T2@T2,Task 2"
a_2_1.gen('c2');
console.log("'c2' sent: " + a_2_1.getConfiguration()); // "T3@T3,Task 2,T2"

a_2_1.gen('Condition');
console.log("'Condition' sent: " + a_2_1.getConfiguration()); // "T3@T3,Task 2,T2@T2"
a_2_1.gen('c');
console.log("'c' sent: " + a_2_1.getConfiguration()); // No effect...
a_2_1.gen('b');
console.log("'b' sent: " + a_2_1.getConfiguration()); // "Join"



