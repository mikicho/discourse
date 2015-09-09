import UrlRefresh from 'discourse/mixins/url-refresh';
import LoadMore from "discourse/mixins/load-more";
import { on } from "ember-addons/ember-computed-decorators";
import computed from "ember-addons/ember-computed-decorators";

export default Ember.View.extend(LoadMore, UrlRefresh, {
  eyelineSelector: '.topic-list-item',

  actions: {
    loadMore() {
      const self = this;
      Discourse.notifyTitle(0);
      this.get('controller').loadMoreTopics().then(hasMoreResults => {
        Ember.run.schedule('afterRender', () => self.saveScrollPosition());
        if (!hasMoreResults) {
          this.get('eyeline').flushRest();
        } else if ($(window).height() >= $(document).height()) {
          this.send("loadMore");
        }
      });
    }
  },

  @on("didInsertElement")
  _readjustScrollPosition() {
    const scrollTo = this.session.get('topicListScrollPosition');
    if (scrollTo && scrollTo >= 0) {
      Ember.run.schedule('afterRender', () => $(window).scrollTop(scrollTo + 1));
    } else if ($(window).height() >= $(document).height()) {
      this.send("loadMore");
    }
  },

  @computed("controller.topicTrackingState.incomingCount")
  _updateTitle(incomingCount) {
    Discourse.notifyTitle(incomingCount);
  },

  // Remember where we were scrolled to
  saveScrollPosition() {
    this.session.set('topicListScrollPosition', $(window).scrollTop());
  },

  // When the topic list is scrolled
  scrolled() {
    this._super();
    this.saveScrollPosition();
  }
});
