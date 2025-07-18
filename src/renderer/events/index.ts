import mitt from 'mitt';

type Events = {
  'file:Change': void; // Triggered when a file is changed
}

const emitter = mitt<Events>();

export default emitter;