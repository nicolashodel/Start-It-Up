import ShoutemApi from './shoutemApi';
const shoutemApi = new ShoutemApi();

export { shoutemApi };

export {
  increaseNumberOfComments,
  decreaseNumberOfComments,
  appendStatus,
  removeStatus,
  updateStatusesAfterLike,
  updateStatusesAfterUnlike,
} from './status';

export {
  adaptUserForSocialActions,
  adaptSocialUserForProfileScreen,
} from './user';
