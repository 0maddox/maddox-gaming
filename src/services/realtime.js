import { createConsumer } from '@rails/actioncable';
import { CABLE_URL } from '../config/env';

let cableConsumer;

function getConsumer() {
  if (!cableConsumer) {
    cableConsumer = createConsumer(CABLE_URL);
  }

  return cableConsumer;
}

export function subscribeToLiveUpdates(onMessage) {
  const consumer = getConsumer();
  const subscription = consumer.subscriptions.create('LiveUpdatesChannel', {
    received(data) {
      if (typeof onMessage === 'function') {
        onMessage(data);
      }
    },
  });

  return () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  };
}
