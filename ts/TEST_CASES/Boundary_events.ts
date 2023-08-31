const BOUNDARY_EVENTS = require("scion-core");
const state_machine = new BOUNDARY_EVENTS.Statechart(
    {
        id: 'TEST',
        states: [
            {
                id: 'X@Loopback',
                onExit: () => {
                    console.log("\tExiting 'X@Loopback'... ");
                },
                transitions: [
                    {
                        event: 'loopback',
                        target: 'X@Loopback'
                    }
                ],
                $type: 'parallel',
                states: [
                    {
                        id: 'R1',
                        states: [
                            {
                                id: 'X',
                                states: [
                                    {
                                        id: 'Interrup.',
                                        transitions: [
                                            {
                                                event: 'a',
                                                target: 'A'
                                            }
                                        ]
                                    }
                                ],
                                transitions: [
                                    {
                                        event: 'c',
                                        target: 'C'
                                    }
                                ]
                            },
                            {
                                id: 'A'
                            },
                            {
                                id: 'C'
                            }
                        ]
                    },
                    {
                        id: 'R2',
                        states: [
                            {
                                id: 'Non-interrup.',
                                transitions: [
                                    {
                                        event: 'a',
                                        target: 'Non-interrup.@Non-interrup.'
                                    },
                                    {
                                        event: 'c',
                                        target: 'Non-interrup.@bpmn:BoundaryEvent'
                                    },
                                    {
                                        event: 'b',
                                        target: 'B'
                                    }
                                ]
                            },
                            {
                                id: 'Non-interrup.@bpmn:BoundaryEvent',
                                transitions: [
                                    {
                                        event: 'b',
                                        target: 'B'
                                    }
                                ]
                            },
                            {
                                id: 'B'
                            }
                        ]
                    }
                ]
            }
        ]
    }
);

state_machine.start();
console.log('Initial: ' + state_machine.getFullConfiguration());
state_machine.gen('b');
// console.log("'b' sent: " + state_machine.getFullConfiguration());
state_machine.gen('a');
console.log("'a' sent: " + state_machine.getFullConfiguration());
state_machine.gen('loopback');
console.log("'loopback' sent: " + state_machine.getFullConfiguration());





