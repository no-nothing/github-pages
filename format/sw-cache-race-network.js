// Promise.race is no good to us because it rejects if a promise rejects before fulfilling.
// Let's make a proper race function:
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    // make sure promises are all promises
    promises = promises.map(p => Promise.resolve(p));
    // resolve this promise as soon as one resolves
    promises.forEach(p => p.then(resolve));
    // reject if all promises reject
    promises
      .reduce((a, b) => a.catch(() => b))
      .catch(() => reject(Error('All failed')));
  });
}

function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    let count = promises.length;
    let resolved = false;
    promises.forEach(p => {
      Promise.resolve(p).then(
        value => {
          count--;
          resolved = true;
          resolve(value);
        },
        () => {
          count--;
          if (count === 0 && !resolved) {
            reject(new Error('All failed.'));
          }
        }
      );
    });
  });
}

self.addEventListener('fetch', event => {
  event.respondWith(
    promiseAny([caches.match(event.request), fetch(event.request)])
  );
});
