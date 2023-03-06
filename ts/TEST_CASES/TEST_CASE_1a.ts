const TEST_CASE_1a = require("scion-core");
const Branch_1a = new TEST_CASE_1a.Statechart({
    id: 'Branch_1a',
    states: [
        {
            id: 'B',
            transitions: [
                {
                    event: 'f',
                    target: 'END1'
                }
            ]
        },
        {
            onEntry: (event: any) => console.log("\tonEntry " + 'END1 from: ' + event.name),
            id: 'END1'
        }
    ]
});
const TEST_CASE_1a_SM = new TEST_CASE_1a.Statechart(
    {
        id: 'TEST_CASE_1a',
        states: [
            {
                id: 'FORK EXC.',
                $type: 'parallel',
                states: [
                    {
                        id: 'R1',
                        states: [
                            {
                                id: 'A@A',
                                transitions: [
                                    {
                                        event: 'c',
                                        target: 'A'
                                    }
                                ]
                            },
                            {
                                id: 'A',
                                transitions: [
                                    {
                                        event: 'd',
                                        target: 'FORK PAR.'
                                    }
                                ]
                            },
                            {
                                id: 'FORK PAR.',
                                $type: 'parallel',
                                states: [
                                    {
                                        onEntry: () => Branch_1a.start(),
                                        id: 'R1a',
                                        transitions: [
                                            {
                                                event: 'f',
                                                // For test only, this cannot be used in liveBPMN.com:
                                                onTransition: () => Branch_1a.gen('f')
                                            }
                                        ]
                                    },
                                    {
                                        id: 'R1b',
                                        states: [
                                            {
                                                id: 'FORK PAR.@JOIN EXC.',
                                                onEntry: () => setTimeout(() => TEST_CASE_1a_SM.gen('completion')),
                                                transitions: [
                                                    {
                                                        cond: (): boolean => TEST_CASE_1a_SM.isIn('FORK EXC.@JOIN EXC.@FORK EXC.@JOIN EXC.'),
                                                        event: 'completion',
                                                        target: 'JOIN EXC.'
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
                        id: 'R2',
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
                                transitions: [
                                    {
                                        cond: (): boolean => TEST_CASE_1a_SM.isIn('A@A'),
                                        event: 'b',
                                        target: 'JOIN EXC.'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'JOIN EXC.'
            }
        ]
    }
);

TEST_CASE_1a_SM.start();
console.log('Initial: ' + TEST_CASE_1a_SM.getConfiguration()); // 'FORK EXC.@JOIN EXC.@FORK EXC.@JOIN EXC.,A@A'
TEST_CASE_1a_SM.gen('c');
console.log("'c' sent: " + TEST_CASE_1a_SM.getConfiguration()); // 'FORK EXC.@JOIN EXC.@FORK EXC.@JOIN EXC.,A'
TEST_CASE_1a_SM.gen('d');
console.log("'d' sent: " + TEST_CASE_1a_SM.getConfiguration() + "," + Branch_1a.getConfiguration()); // 'FORK EXC.@JOIN EXC.@FORK EXC.@JOIN EXC.,FORK PAR.@JOIN EXC.,R1a,B'
TEST_CASE_1a_SM.gen('f');
