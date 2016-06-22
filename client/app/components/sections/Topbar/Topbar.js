/* eslint-disable no-console */

import { Component, PropTypes } from 'react';
import r, { div } from 'r-dom';
import * as placesUtils from '../../../utils/places';

import { t } from '../../../utils/i18n';
import { routes as routesProp, marketplaceContext } from '../../../utils/PropTypes';
import css from './Topbar.css';
import styleVariables from '../../../assets/styles/variables';

import Logo from '../../elements/Logo/Logo';
import SearchBar from '../../composites/SearchBar/SearchBar';
import Menu from '../../composites/Menu/Menu';
import MenuMobile from '../../composites/MenuMobile/MenuMobile';
import AvatarDropdown from '../../composites/AvatarDropdown/AvatarDropdown';
import AddNewListingButton from '../../elements/AddNewListingButton/AddNewListingButton';
import LoginLinks from '../../composites/LoginLinks/LoginLinks';

const profileDropdownActions = function profileDropdownActions(routes, username) {
  return username ?
  {
    inboxAction: routes.person_inbox_path(username),
    profileAction: routes.person_path(username),
    settingsAction: routes.person_settings_path(username),
    adminDashboardAction: routes.admin_path(),
    logoutAction: routes.logout_path(),
  } : null;
};

const avatarDropdownProps = (avatarDropdown, customColor, username, routes) => {
  const color = customColor || styleVariables['--customColorFallback'];
  const actions = {
    inboxAction: () => false,
    profileAction: () => false,
    settingsAction: () => false,
    adminDashboardAction: () => false,
    logoutAction: () => false,
    ...profileDropdownActions(routes, username),
  };
  return { actions, customColor: color, ...avatarDropdown };
};

const LABEL_TYPE_MENU = 'menu';
const LABEL_TYPE_DROPDOWN = 'dropdown';

const SEARCH_ENABLED = true;

const profileLinks = function profileLinks(username, router, location, customColor) {
  if (username) {
    return [
      {
        active: router.person_inbox_path(username) === location,
        activeColor: customColor,
        content: t('web.topbar.inbox'),
        href: router.person_inbox_path(username),
        type: 'menuitem',
      },
      {
        active: router.person_path(username) === location,
        activeColor: customColor,
        content: t('web.topbar.profile'),
        href: router.person_path(username),
        type: 'menuitem',
      },
      {
        active: `${router.person_path(username)}?show_closed=1` === location,
        activeColor: customColor,
        content: t('web.topbar.manage_listings'),
        href: `${router.person_path(username)}?show_closed=1`,
        type: 'menuitem',
      },
      {
        active: router.person_settings_path(username) === location,
        activeColor: customColor,
        content: t('web.topbar.settings'),
        href: router.person_settings_path(username),
        type: 'menuitem',
      },
      {
        active: router.logout_path() === location,
        activeColor: customColor,
        content: t('web.topbar.logout'),
        href: router.logout_path(),
        type: 'menuitem',
      },
    ];
  }
  return [];
};

const DEFAULT_CONTEXT = {
  marketplace_color1: styleVariables['--customColorFallback'],
  marketplace_color2: styleVariables['--customColor2Fallback'],
  loggedInUsername: null,
};

const parseQuery = (searchQuery) => {
  const parts = (searchQuery || '')
          .replace(/^\?/, '')
          .replace(/#.*$/, '')
          .split('&');

  return parts.reduce((params, keyval) => {
    const pair = keyval.split('=');
    const pairLength = 2;
    if (pair.length === pairLength) {
      params[pair[0]] = decodeURIComponent(pair[1]); // eslint-disable-line no-param-reassign
    }
    return params;
  }, {});
};

const currentSearchParams = (searchQuery) => {
  const PARAMS_TO_KEEP = ['view', 'locale'];
  const parsedParams = parseQuery(searchQuery);

  return Object.keys(parsedParams).reduce((params, key) => {
    if (PARAMS_TO_KEEP.includes(key)) {
      params[key] = parsedParams[key]; // eslint-disable-line no-param-reassign
    }
    return params;
  }, {});
};

const isValid = (value) => typeof value === 'number' && !isNaN(value) || !!value;

const createQuery = (searchParams) => {
  const extraParams = currentSearchParams(window.location.search);
  const params = { ...extraParams, ...searchParams };

  console.log('creating query string from params:', params);
  const paramKeys = Object.keys(params);
  paramKeys.sort();

  return paramKeys.reduce((url, key) => {
    const val = params[key];

    if (!isValid(val)) {
      return url;
    }

    return `${url}${url ? '&' : '?'}${key}=${encodeURIComponent(val)}`;
  }, '');
};

class Topbar extends Component {
  render() {
    const { location, marketplace_color1, loggedInUsername } = { ...DEFAULT_CONTEXT, ...this.props.marketplaceContext };

    const menuProps = this.props.menu ?
      Object.assign({}, this.props.menu, {
        key: 'menu',
        name: t('web.topbar.menu'),
        identifier: 'Menu',
        menuLabelType: LABEL_TYPE_MENU,
        content: this.props.menu.links.map((l) => (
          {
            active: l.link === location,
            activeColor: marketplace_color1,
            content: l.title,
            href: l.link,
            type: 'menuitem',
          }
        )),
      }) :
      {};

    const available_locales = this.props.locales ? this.props.locales.available_locales : null;
    const hasMultipleLanguages = available_locales && available_locales.length > 1;
    const languageMenuProps = hasMultipleLanguages ?
      Object.assign({}, {
        key: 'languageMenu',
        name: this.props.locales.current_locale,
        identifier: 'LanguageMenu',
        menuLabelType: LABEL_TYPE_DROPDOWN,
        extraClassesLabel: `${css.topbarLanguageMenuLabel}`,
        content: this.props.locales.available_locales.map((v) => (
          {
            active: v.locale_ident === this.props.locales.current_locale_ident,
            activeColor: marketplace_color1,
            content: v.locale_name,
            href: v.change_locale_uri,
            type: 'menuitem',
          }
        )),
      }) :
      {};

    const newListingRoute = this.props.routes && this.props.routes.new_listing_path ?
            this.props.routes.new_listing_path() :
            '#';

    const profileRoute = this.props.routes && this.props.routes.person_path && loggedInUsername ?
            this.props.routes.person_path(loggedInUsername) :
            null;
    const mobileMenuAvatarProps = this.props.avatarDropdown && loggedInUsername ?
            { ...this.props.avatarDropdown.avatar, ...{ url: profileRoute } } :
          null;

    const pathParams = { return_to: location };
    const loginRoute = this.props.routes.login_path ? this.props.routes.login_path(pathParams) : '#';
    const signupRoute = this.props.routes.sign_up_path ? this.props.routes.sign_up_path() : '#';

    const mobileMenuProps = this.props.menu ?
      Object.assign({}, this.props.menu, {
        key: 'mobilemenu',
        name: t('web.topbar.menu'),
        identifier: 'Menu',
        menuLabelType: LABEL_TYPE_MENU,
        color: marketplace_color1,
        extraClasses: `${css.topbarMobileMenu}`,
        menuLinksTitle: t('web.topbar.menu'),
        menuLinks: this.props.menu.links.map((l) => (
          {
            active: l.link === location,
            activeColor: marketplace_color1,
            content: l.title,
            href: l.link,
            type: 'menuitem',
          }
        )),
        userLinksTitle: t('web.topbar.user'),
        userLinks: profileLinks(loggedInUsername, this.props.routes, location, marketplace_color1),
        avatar: mobileMenuAvatarProps,
        newListingButton: this.props.newListingButton ?
          { ...this.props.newListingButton, ...{ url: newListingRoute, mobileLayoutOnly: true } } :
          null,
        loginLinks: {
          loginUrl: loginRoute,
          signupUrl: signupRoute,
          customColor: marketplace_color1,
        },
      }) :
      {};

    return div({ className: css.topbar }, [
      this.props.menu ? r(MenuMobile, { ...mobileMenuProps, className: css.topbarMobileMenu }) : null,
      r(Logo, { ...this.props.logo, classSet: css.topbarLogo }),
      div({ className: css.topbarMediumSpacer }),
      SEARCH_ENABLED && this.props.search ?
        r(SearchBar, {
          mode: this.props.search.mode,
          keywordPlaceholder: this.props.search.keyword_placeholder,
          locationPlaceholder: this.props.search.location_placeholder,
          keywordQuery: this.props.search.keyword_query,
          locationQuery: this.props.search.location_query,
          onSubmit: ({ keywordQuery, locationQuery, place }) => {
            console.log({ // eslint-disable-line no-console
              keywordQuery,
              locationQuery,
              coordinates: placesUtils.coordinates(place),
              viewport: placesUtils.viewport(place),
              maxDistance: placesUtils.maxDistance(place),
            });
            const query = createQuery({
              q: keywordQuery,
              lq: locationQuery,
              lc: placesUtils.coordinates(place),
              boundingbox: placesUtils.viewport(place),
              distance_max: placesUtils.maxDistance(place),
            });
            const searchUrl = `${this.props.search_path}${query}`;
            console.log('Search URL:', `"${searchUrl}"`);

            window.location.assign(searchUrl);
          },
        }) :
        null,
      this.props.menu ? r(Menu, { ...menuProps, className: css.topbarMenu }) : null,
      div({ className: css.topbarSpacer }),
      hasMultipleLanguages ? r(Menu, { ...languageMenuProps, className: css.topbarMenu }) : null,
      this.props.avatarDropdown && loggedInUsername ?
        r(AvatarDropdown, {
          ...avatarDropdownProps(this.props.avatarDropdown, marketplace_color1, loggedInUsername, this.props.routes),
          classSet: css.topbarAvatarDropdown,
        }) :
        r(LoginLinks, {
          loginUrl: loginRoute,
          signupUrl: signupRoute,
          customColor: marketplace_color1,
        }),
      this.props.newListingButton ?
        r(AddNewListingButton, {
          ...this.props.newListingButton,
          className: css.topbarListingButton,
          url: newListingRoute,
          customColor: marketplace_color1,
        }) :
      null,
    ]);
  }
}

const { string, object, shape, arrayOf } = PropTypes;

/* eslint-disable react/forbid-prop-types */
Topbar.propTypes = {
  logo: object.isRequired,
  search: object,
  search_path: PropTypes.string.isRequired,
  avatarDropdown: object,
  menu: shape({
    links: arrayOf(shape({
      title: string.isRequired,
      link: string.isRequired,
    })),
  }),
  locales: PropTypes.shape({
    current_locale: string.isRequired,
    current_locale_ident: string.isRequired,
    available_locales: arrayOf(shape({
      locale_name: string.isRequired,
      locale_ident: string.isRequired,
      change_locale_uri: string.isRequired,
    })),
  }),
  newListingButton: object,
  routes: routesProp,
  marketplaceContext,
};

export default Topbar;
