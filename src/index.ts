import { SplatNet2Job } from './SplatNet2/SplatNet2Job';

declare var global: any;

global.pullNextResult = SplatNet2Job.runPullNextResult;
