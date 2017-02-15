/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {loadScript} from './3p';
import {user} from '../src/log';


/**
 * Produces the Facebook SDK object for the passed in callback.
 *
 * Note: Facebook SDK fails to render multiple posts when the SDK is only loaded
 * in one frame. To Allow the SDK to render them correctly we load the script
 * per iframe.
 *
 * @param {!Window} global
 * @param {function(!Object)} cb
 */
function getFacebookSdk(global, cb) {
  loadScript(global, 'https://connect.facebook.net/en_US/sdk.js', () => {
    cb(global.FB);
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getPostContainer(global, data) {
  const container = global.document.createElement('div');
  const embedAs = data.embedAs || 'post';
  user().assert(['post', 'video'].indexOf(embedAs) !== -1,
      'Attribute data-embed-as  for <amp-facebook> value is wrong, should be' +
      ' "post" or "video" was: %s', embedAs);
  container.className = 'fb-' + embedAs;
  container.setAttribute('data-href', data.href);

  return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getCommentsContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'fb-comments';
  container.setAttribute('data-href', data.href);
  container.setAttribute('data-numposts', data.numposts);
  container.setAttribute('data-order-by', data.orderBy);
  container.setAttribute('data-width', '100%');

  return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function facebook(global, data) {
  const extension = global.context.tagName;
  let container;

  if (extension === 'AMP-FACEBOOK-COMMENTS') {
    container = getCommentsContainer(global, data);
  } else if(extension === 'AMP-FACEBOOK') {
    container = getPostContainer(global, data);
  }

  global.document.getElementById('c').appendChild(container);

  getFacebookSdk(global, FB => {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;


    FB.Event.subscribe('xfbml.resize', event => {
      context.updateDimensions(
        parseInt(event.width, 10),
        parseInt(event.height, 10) + /* margins */ 20);
    });

    FB.init({xfbml: true, version: 'v2.5'});
  });

}
