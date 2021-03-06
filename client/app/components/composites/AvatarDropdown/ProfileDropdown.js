import { Component, PropTypes } from 'react';
import r, { div, a } from 'r-dom';
import classNames from 'classnames';

import css from './ProfileDropdown.css';
import inboxEmptyIcon from './images/inboxEmptyIcon.svg';
import profileIcon from './images/profileIcon.svg';
import settingsIcon from './images/settingsIcon.svg';
import { className } from '../../../utils/PropTypes';

const actionProps = function actionProps(action) {
  return (typeof action) === 'function' ?
    { onClick: action } :
    { href: action };
};

class ProfileActionCard extends Component {
  render() {
    return a({ ...actionProps(this.props.action), className: css.profileAction }, [
      div({ className: css.profileActionIcon, dangerouslySetInnerHTML: { __html: this.props.icon } }),
      div({ className: css.profileActionLabel }, this.props.label),
    ]);
  }
}

const eitherStringOrFunc = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.func,
]);

ProfileActionCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  action: eitherStringOrFunc.isRequired,
};

class ProfileDropdown extends Component {
  render() {
    return div({
      className: classNames(css.profileDropdown, this.props.className),
    }, [
      div({ className: css.rootArrow }),
      div({ className: css.box }, [
        div({ className: css.profileActions }, [
          r(ProfileActionCard, { label: this.props.translations.inbox, icon: inboxEmptyIcon, action: this.props.actions.inboxAction }),
          r(ProfileActionCard, { label: this.props.translations.profile, icon: profileIcon, action: this.props.actions.profileAction }),
          r(ProfileActionCard, { label: this.props.translations.settings, icon: settingsIcon, action: this.props.actions.settingsAction }),
        ]),
        div({ className: css.logoutArea }, [
          this.props.isAdmin ? a({
            className: css.adminLink,
            style: { color: this.props.customColor },
            ...actionProps(this.props.actions.adminDashboardAction),
          }, this.props.translations.adminDashboard) : null,
          a({
            className: css.logoutLink,
            ...actionProps(this.props.actions.logoutAction),
          }, this.props.translations.logout),
        ]),
      ]),
    ]);
  }
}

ProfileDropdown.propTypes = {
  actions: PropTypes.shape({
    inboxAction: eitherStringOrFunc.isRequired,
    profileAction: eitherStringOrFunc.isRequired,
    settingsAction: eitherStringOrFunc.isRequired,
    adminDashboardAction: eitherStringOrFunc.isRequired,
    logoutAction: eitherStringOrFunc.isRequired,
  }).isRequired,
  translations: PropTypes.shape({
    inbox: PropTypes.string.isRequired,
    profile: PropTypes.string.isRequired,
    settings: PropTypes.string.isRequired,
    adminDashboard: PropTypes.string.isRequired,
    logout: PropTypes.string.isRequired,
  }),
  customColor: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  className,
};

export default ProfileDropdown;
