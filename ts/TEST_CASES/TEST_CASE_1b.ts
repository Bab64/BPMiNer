const TEST_CASE_1b = require("scion-core");
const Branch_1b = new TEST_CASE_1b.Statechart({
    id: 'Branch_1b',
    states: [
        {
            id: 'Event@Event',
            transitions: [
                {
                    event: 'e',
                    target: 'Event'
                }
            ]
        },
        {
            onEntry: (event: any) => console.log("\tonEntry " + 'Event from: ' + event.name),
            id: 'Event',
            transitions: [
                {
                    event: 'g',
                    target: 'END1'
                }
            ]
        },
        {
            id: 'END1'
        }
    ]
});
const TEST_CASE_1b_SM = new TEST_CASE_1b.Statechart(
    {
        id: 'TEST_CASE_1b',
        states: [
            {
                id: 'FORK EXC.',
                $type: 'parallel',
                states: [
                    {
                        id: 'R1',
                        states: [
                            {
                                id: 'FORK EXC.@JOIN EXC.@FORK EXC.@JOIN EXC.',
                                transitions: [
                                    {
                                        event: 'b',
                                        target: 'FORK EXC.@JOIN EXC.'
                                    }
                                ]
                            },
                            {
                                id: 'FORK EXC.@JOIN EXC.',
                                onEntry: () => setTimeout(() => TEST_CASE_1b_SM.gen('b')),
                                transitions: [
                                    {
                                        cond: (): boolean => TEST_CASE_1b_SM.isIn('Task@Task'),
                                        event: 'b',
                                        target: 'JOIN EXC.'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'R2',
                        states: [
                            {
                                id: 'Task@Task',
                                transitions: [
                                    {
                                        event: 'c',
                                        target: 'Task'
                                    }
                                ]
                            },
                            {
                                onEntry: (event: any) => console.log("\tonEntry " + 'Task from: ' + event.name),
                                id: 'Task',
                                transitions: [
                                    {
                                        event: 'd',
                                        target: 'FORK COMP.'
                                    }
                                ]
                            },
                            {
                                id: 'FORK COMP.',
                                $type: 'parallel',
                                states: [
                                    {
                                        onEntry: () => Branch_1b.start(),
                                        id: 'R2a',
                                        transitions: [
                                            {
                                                event: 'e',
                                                // For test only, this cannot be used in liveBPMN.com:
                                                onTransition: () => Branch_1b.gen('e')
                                            }
                                            // This does not work after leaving 'R2a':
                                            // {
                                            //     event: 'g',
                                            //     onTransition: () => Branch_1b.gen('g')
                                            // }
                                        ]
                                    },
                                    {
                                        id: 'R2b', states: [
                                            {
                                                onEntry: (event: any) => console.log("\tonEntry " + 'FORK COMP.@JOIN EXC.@FORK COMP.@JOIN EXC. from: ' + event.name),
                                                id: 'FORK COMP.@JOIN EXC.@FORK COMP.@JOIN EXC.',
                                                transitions: [
                                                    {
                                                        event: 'f',
                                                        target: 'FORK COMP.@JOIN EXC.'
                                                    }
                                                ]
                                            },
                                            {
                                                onEntry: (event: any) => {
                                                    console.log("\tonEntry " + 'FORK COMP.@JOIN EXC. from: ' + event.name);
                                                    setTimeout(() => TEST_CASE_1b_SM.gen('f'));
                                                },
                                                id: 'FORK COMP.@JOIN EXC.',
                                                transitions: [
                                                    {
                                                        cond: (): boolean => Branch_1b.isIn('Event@Event'),
                                                        event: 'f',
                                                        target: 'JOIN EXC.'
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                onEntry: (event: any) => console.log("\tonEntry " + 'JOIN EXC. from: ' + event.name),
                id: 'JOIN EXC.'
            }
        ]
    }
);

// TEST_CASE_1b_SM.start();
// console.log('Initial: ' + TEST_CASE_1b_SM.getConfiguration()); // 'Task@Task,FORK EXC.@JOIN EXC.@FORK EXC.@JOIN EXC.'
// TEST_CASE_1b_SM.gen('b');
// console.log("'b' sent: " + TEST_CASE_1b_SM.getConfiguration()); // 'JOIN EXC.'
// setTimeout(() => {TEST_CASE_1b_SM.gen('c')});
// console.log("'c' sent: " + TEST_CASE_1b_SM.getConfiguration()); // No effect...

TEST_CASE_1b_SM.start();
console.log('Initial: ' + TEST_CASE_1b_SM.getConfiguration()); // 'Task@Task,FORK EXC.@JOIN EXC.@FORK EXC.@JOIN EXC.'
TEST_CASE_1b_SM.gen('c');
TEST_CASE_1b_SM.gen('d');
TEST_CASE_1b_SM.gen('e');
TEST_CASE_1b_SM.gen('f');
