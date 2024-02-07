import { render } from 'react-dom';
import { RouterWrapper } from '../src/router.tsx';

// TODO: not sure why ts doesn't like this
render(<RouterWrapper />, document.getElementById('app') as HTMLElement);
