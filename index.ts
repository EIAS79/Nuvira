import { Nuvira } from './lib/nuvira';


async function run() {
    const sqon = new Nuvira( {filePath: './test.nuv'});
    console.log(await sqon.parse())
}
run()