const TEST_CASE_2a = require("scion-core");
const TEST_CASE_2a_SM = new TEST_CASE_2a.Statechart(
    {
        id: 'TEST_CASE_2a',
        states: [
            {
                id: 'FORK INC.',
                $type: 'parallel',
                states: [
                    {
                        id: 'R1',
                        states: [
                            {
                                id: 'NOT YET FORK INC.@JOIN INC.',
                                transitions: [
                                    {
                                        event: 'b',
                                        target: 'FORK INC.@JOIN INC.'
                                    }
                                ]
                            },
                            {
                                id: 'FORK INC.@JOIN INC.',
                                onEntry: () => {
                                    setTimeout(() => {
                                        TEST_CASE_2a_SM.gen('b');
                                        console.log("setTimeout: " + TEST_CASE_2a_SM.getConfiguration());
                                    });
                                },
                                transitions: [
                                    {
                                        cond: (): boolean => TEST_CASE_2a_SM.isIn('A@A'),
                                        event: 'b',
                                        target: 'JOIN INC.'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'R2',
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
                                        id: 'END1'
                                    },
                                    {
                                        id: 'FORK PAR.@JOIN INC.',
                                        onEntry: () => {
                                            setTimeout(() => {
                                                TEST_CASE_2a_SM.gen('completion');
                                                console.log("setTimeout: " + TEST_CASE_2a_SM.getConfiguration());
                                            });
                                        },
                                        transitions: [
                                            {
                                                event: 'completion', // Transition without event...
                                                target: 'JOIN INC.'
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
                id: 'JOIN INC.'
            }
        ]
    }
);

TEST_CASE_2a_SM.start();
console.log('Initial: ' + TEST_CASE_2a_SM.getConfiguration()); // 'A@A,NOT YET FORK INC.@JOIN INC.'
TEST_CASE_2a_SM.gen('b');
console.log("'b' sent: " + TEST_CASE_2a_SM.getConfiguration());
TEST_CASE_2a_SM.gen('c');
console.log("'c' sent: " + TEST_CASE_2a_SM.getConfiguration());
TEST_CASE_2a_SM.gen('d');
console.log("'d' sent: " + TEST_CASE_2a_SM.getConfiguration());
