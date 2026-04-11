import { createConsumer } from '@rails/actioncable';

const runtimeCableUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:3000/cable`
    : 'ws://localhost:3000/cable';

const CABLE_URL = process.env.REACT_APP_CABLE_URL || runtimeCableUrl;

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
