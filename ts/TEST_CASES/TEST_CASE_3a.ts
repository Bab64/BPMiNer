const TEST_CASE_3a = require("scion-core");
const TEST_CASE_3a_branch_SM = new TEST_CASE_3a.Statechart({
    id: 'TEST_CASE_3a_branch',
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
            id: 'END1'
        }
    ]
});
const TEST_CASE_3a_SM = new TEST_CASE_3a.Statechart(
    {
        id: 'TEST_CASE_3a',
        states: [
            {
                id: 'FORK PAR.',
                $type: 'parallel',
                states: [
                    {
                        id: 'R1',
                        states: [
                            {
                                id: 'A',
                                transitions: [
                                    {
                                        event: 'b',
                                        target: 'FORK INC.'
                                    }
                                ]
                            },
                            {
                                id: 'FORK INC.',
                                $type: 'parallel',
                                states: [
                                    {
                                        id: 'R1a',
                                        states: [
                                            {
                                                id: 'B@B',
                                                transitions: [
                                                    {
                                                        event: 'c',
                                                        onTransition: (event: any) => TEST_CASE_3a_branch_SM.start(),
                                                        target: 'B@B'
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        id: 'R1b',
                                        states: [
                                            {
                                                id: 'FORK INC.@JOIN PAR.',
                                                transitions: [
                                                    {
                                                        cond: (): boolean => {
                                                            //console.log("\t\t'TEST_CASE_3a_SM.isIn('FORK PAR.@JOIN PAR.')': " + TEST_CASE_3a_SM.isIn('FORK PAR.@JOIN PAR.'));
                                                            return TEST_CASE_3a_SM.isIn('FORK PAR.@JOIN PAR.');
                                                        },
                                                        event: 'd',
                                                        target: 'JOIN PAR.'
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
                                id: 'FORK PAR.@JOIN PAR.',
                                transitions: [
                                    {
                                        cond: (): boolean => {
                                            //console.log("\t\t'TEST_CASE_3a_SM.isIn('FORK INC.@JOIN PAR.')': " + TEST_CASE_3a_SM.isIn('FORK INC.@JOIN PAR.'));
                                            return TEST_CASE_3a_SM.isIn('FORK INC.@JOIN PAR.');
                                        },
                                        event: 'completion',
                                        target: 'JOIN PAR.'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'JOIN PAR.'
            }
        ]
    }
);

TEST_CASE_3a_SM.start();
console.log('Initial: ' + TEST_CASE_3a_SM.getConfiguration()); // 'FORK PAR.@JOIN PAR.,A'
TEST_CASE_3a_SM.gen('b');
console.log("'b' sent: " + TEST_CASE_3a_SM.getConfiguration()); // 'FORK PAR.@JOIN PAR.,FORK INC.@JOIN PAR.,B@B'
TEST_CASE_3a_SM.gen('c');
console.log("'c' sent: " + TEST_CASE_3a_SM.getConfiguration() + "," + TEST_CASE_3a_branch_SM.getConfiguration()); // 'FORK PAR.@JOIN PAR.,FORK INC.@JOIN PAR.,B@B,B'
TEST_CASE_3a_SM.gen('d');
console.log("'d' sent: " + TEST_CASE_3a_SM.getConfiguration() + "," + TEST_CASE_3a_branch_SM.getConfiguration()); // 'JOIN PAR.,B'
