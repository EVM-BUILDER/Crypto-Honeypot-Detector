'use strict';
import Express from './Express';

class App {

	// Loads your Server
	public static loadServer (): void {
		Express.init().then();
	}
}

export default App;
