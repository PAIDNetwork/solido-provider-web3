import 'jasmine';
import { SolidoContract, SolidoProvider, SolidoModule, IMethodOrEventCall, Read, Write, EventFilterOptions, GetEvents } from '@decent-bet/solido';
import { Web3Plugin, Web3Settings, Web3SolidoTopic } from '../src';
const Web3 = require('web3');
const CocoTokenImport = require('./CocoToken.json')

describe('Web3Provider', () => {
    describe('#Web3Plugin', () => {
        let web3;
        let tokenContract;
        beforeEach(async () => {
            const privateKey = '';
            const network = 'development';
            const defaultAccount = '0xae5ba923447cb11f2a94b66dff878b0d7cfdd13c';
            const node = 'http://localhost:8545';

            web3 = {
                eth: {
                    Contract: function() {},
                    accounts: {
                        wallet: {
                            add: jasmine.createSpy()
                        },
                        signTransaction: jasmine.createSpy('signTransaction')
                    }
                }
            } as any;
            // Create Solido Module
            const module = new SolidoModule([
                {
                    name: 'CocoToken',
                    import: {
                        address: {
                            development: CocoTokenImport.networks['1555175807639'].address,
                        },
                        raw: CocoTokenImport
                    },
                    enableDynamicStubs: true,
                    provider: Web3Plugin
                }
            ]);

            const contracts = module.bindContracts();
            const token = contracts.getDynamicContract('CocoToken');
            expect(contracts).not.toBe(null);
            expect(token).not.toBe(null);

            tokenContract = token;

            token.onReady<Web3Settings>({
                defaultAccount,
                privateKey,
                network,
                web3
            });
            

            expect(token.address).toBeDefined();
        });

        it('should generate topics for Connex', async () => {
            const topics = new Web3SolidoTopic();

            const seq = topics
                .topic('0xc')
                .and('0xb')
                .or('0xa')
                .get();

            expect(seq[0].length).toBe(2);
        });

        it('should create a Read(), execute it and return a response', async () => {
            // Mock
            const obj = {
                callMethod: jasmine.createSpy('callMethod')
            };
            const options: IMethodOrEventCall = {};
            const thunk = Read(options);
            thunk(obj, 'balanceOf');
            expect((obj as any).balanceOf).toBeDefined();
            (obj as any).balanceOf();
            expect(obj.callMethod.calls.count()).toBe(1);
        });

        it('should create a Write() and return a Promise', async () => {
            const signerMock: any = {
                requestSigning: jasmine.createSpy('requestSigning')
            };
            // Mock
            const obj = {
                prepareSigning: jasmine
                    .createSpy('prepareSigning')
                    .and.returnValue(Promise.resolve(signerMock)),
                getMethod: jasmine.createSpy('getMethod')
            };
            const thunk = Write();
            thunk(obj, 'transfer');
            expect((obj as any).transfer).toBeDefined();
            (obj as any).transfer([]);
            expect(obj.getMethod.calls.count()).toBe(1);
            expect(obj.prepareSigning.calls.count()).toBe(1);
        });

        it('should prepare signing and call signTransaction', async () => {
            const methodCall =  jasmine.createSpy()
                .and.returnValue({
                    call: () => Promise.resolve(true),
                    encodeABI: () => '0x6fc82f0b3531353536323337303235000000000000000000000000000000000000000000000000000000000000000000bdca9e6d4d9c7dc7774e84c98617b40869d354680000000000000000000000000000000000000000000000000000000000000003'
                })
            const values = [0, 1, 2];
            tokenContract.prepareSigning(methodCall, {}, values)
            expect(methodCall).toHaveBeenCalled();

        });

        it('should create a GetEvents(), execute it and return a response', async () => {
            // Mock
            const obj = {
                getEvents: jasmine.createSpy('getEvents')
            };
            const options: EventFilterOptions<any> = {};
            const thunk = GetEvents(options);
            thunk(obj, 'logNewTransfer');
            expect((obj as any).logNewTransfer).toBeDefined();
            (obj as any).logNewTransfer();
            expect(obj.getEvents.calls.count()).toBe(1);
        });
    });
});
