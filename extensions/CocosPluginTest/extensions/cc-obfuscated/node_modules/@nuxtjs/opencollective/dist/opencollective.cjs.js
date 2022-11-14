'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var consola = _interopDefault(require('consola'));
var child_process = require('child_process');
var chalk = _interopDefault(require('chalk'));
var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));
var fetch = _interopDefault(require('node-fetch'));

const reportAndThrowError = msg => {
  report(msg);
  throw new Error(msg);
};
const report = message => {
  consola.debug({
    message: String(message),
    tag: 'opencollective'
  });
};
const hideMessage = (env = process.env) => {
  // Show message if it is forced
  if (env.OPENCOLLECTIVE_FORCE) {
    return false;
  } // Don't show after oracle postinstall


  if (env.OC_POSTINSTALL_TEST) {
    return true;
  } // Don't show if opted-out


  if (env.OPENCOLLECTIVE_HIDE) {
    return true;
  } // Don't show if on CI


  if (env.CI || env.CONTINUOUS_INTEGRATION) {
    return true;
  } // Only show in dev environment


  return Boolean(env.NODE_ENV) && !['dev', 'development'].includes(env.NODE_ENV);
};
const formatMoney = currency => amount => {
  amount = amount / 100; // converting cents

  const precision = 0;
  return amount.toLocaleString(currency, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });
};
const isWin32 = process.platform === 'win32';
const stripLeadingSlash = s => s.startsWith('/') ? s.substring(1) : s;
const stripTrailingSlash = s => s.endsWith('/') ? s.slice(0, -1) : s;

/* eslint-disable no-console */
const print = (color = null) => (str = '') => {
  const terminalCols = retrieveCols();
  const strLength = str.replace(/\u001b\[[0-9]{2}m/g, '').length;
  const leftPaddingLength = Math.floor((terminalCols - strLength) / 2);
  const leftPadding = ' '.repeat(Math.max(leftPaddingLength, 0));

  if (color) {
    str = chalk[color](str);
  }

  console.log(leftPadding, str);
};
const retrieveCols = (() => {
  let result = false;
  return () => {
    if (result) {
      return result;
    }

    const defaultCols = 80;

    try {
      const terminalCols = child_process.execSync(`tput cols`, {
        stdio: ['pipe', 'pipe', 'ignore']
      });
      result = parseInt(terminalCols.toString()) || defaultCols;
    } catch (e) {
      result = defaultCols;
    }

    return result;
  };
})();
const printStats = (stats, color) => {
  if (!stats) {
    return;
  }

  const colored = print(color);
  const bold = print('bold');
  const formatWithCurrency = formatMoney(stats.currency);
  colored(`Number of contributors: ${stats.contributorsCount}`);
  colored(`Number of backers: ${stats.backersCount}`);
  colored(`Annual budget: ${formatWithCurrency(stats.yearlyIncome)}`);
  bold(`Current balance: ${formatWithCurrency(stats.balance)}`, 'bold');
};
const printLogo = logoText => {
  if (!logoText) {
    return;
  }

  logoText.split('\n').forEach(print('blue'));
};
/**
 * Only show emoji on OSx (Windows shell doesn't like them that much ¯\_(ツ)_/¯ )
 * @param {*} emoji
 */

const emoji = emoji => process.stdout.isTTY && !isWin32 ? emoji : '';
function printFooter(collective) {
  const dim = print('dim');
  const yellow = print('yellow');
  const emptyLine = print();
  yellow(`Thanks for installing ${collective.slug} ${emoji('🙏')}`);
  dim(`Please consider donating to our open collective`);
  dim(`to help us maintain this package.`);
  emptyLine();
  printStats(collective.stats);
  emptyLine();
  print()(`${chalk.bold(`${emoji('👉 ')} ${collective.donationText}`)} ${chalk.underline(collective.donationUrl)}`);
  emptyLine();
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

const FETCH_TIMEOUT = 3000;

const fetchJson = url => new Promise(function ($return, $error) {
  var $Try_1_Post = function () {
    try {
      return $return();
    } catch ($boundEx) {
      return $error($boundEx);
    }
  };

  var $Try_1_Catch = function (e) {
    try {
      report(e);
      reportAndThrowError(`Could not fetch ${url}.json`);
      return $Try_1_Post();
    } catch ($boundEx) {
      return $error($boundEx);
    }
  };

  try {
    return Promise.resolve(global.fetch(`${url}.json`, {
      timeout: FETCH_TIMEOUT
    })).then(function ($await_5) {
      try {
        return $return($await_5.json());
      } catch ($boundEx) {
        return $Try_1_Catch($boundEx);
      }
    }, $Try_1_Catch);
  } catch (e) {
    $Try_1_Catch(e);
  }
});

const fetchStats = collectiveUrl$$1 => new Promise(function ($return, $error) {
  var $Try_2_Post = function () {
    try {
      return $return();
    } catch ($boundEx) {
      return $error($boundEx);
    }
  };

  var $Try_2_Catch = function (e) {
    try {
      report(e);
      report(`Could not load the stats for ${collectiveSlugFromUrl(collectiveUrl$$1)}`);
      return $Try_2_Post();
    } catch ($boundEx) {
      return $error($boundEx);
    }
  };

  try {
    return Promise.resolve(fetchJson(collectiveUrl$$1)).then($return, $Try_2_Catch);
  } catch (e) {
    $Try_2_Catch(e);
  }
});
const fetchLogo = logoUrl => new Promise(function ($return, $error) {
  if (!logoUrl) {
    // Silent return if no logo has been provided
    return $return();
  }

  if (!logoUrl.match(/^https?:\/\//)) {
    reportAndThrowError(`Your logo URL isn't well-formatted - ${logoUrl}`);
  }

  var $Try_3_Post = function () {
    try {
      return $return();
    } catch ($boundEx) {
      return $error($boundEx);
    }
  };

  var $Try_3_Catch = function (e) {
    try {
      report(`Error while fetching logo from ${logoUrl}`);
      return $Try_3_Post();
    } catch ($boundEx) {
      return $error($boundEx);
    }
  };

  try {
    let res;
    return Promise.resolve(global.fetch(logoUrl, {
      timeout: FETCH_TIMEOUT
    })).then(function ($await_7) {
      try {
        res = $await_7;

        if (isLogoResponseWellFormatted(res)) {
          return $return(res.text());
        }

        report(`Error while fetching logo from ${logoUrl}. The response wasn't well-formatted`);
        return $Try_3_Post();
      } catch ($boundEx) {
        return $Try_3_Catch($boundEx);
      }
    }, $Try_3_Catch);
  } catch (e) {
    $Try_3_Catch(e);
  }
});

const isLogoResponseWellFormatted = res => res.status === 200 && res.headers.get('content-type').match(/^text\/plain/);

const fetchPkg = pathToPkg => {
  const fullPathToPkg = path.resolve(`${pathToPkg}/package.json`);

  try {
    return JSON.parse(fs.readFileSync(fullPathToPkg, 'utf8'));
  } catch (e) {
    reportAndThrowError(`Could not find package.json at ${fullPathToPkg}`);
  }
};

const collectiveSlugFromUrl = url => url.substr(url.lastIndexOf('/') + 1).toLowerCase().replace(/\.json/g, '');
const collectiveUrl = pkg => {
  const url = pkg.collective && pkg.collective.url;

  if (!url) {
    reportAndThrowError('No collective URL set!');
  }

  return stripTrailingSlash(url);
}; // use pkg.collective.logo for "legacy"/compatibility reasons

const collectiveLogoUrl = pkg => pkg.collective.logo || pkg.collective.logoUrl || false;
const collectiveDonationText = pkg => pkg.collective.donation && pkg.collective.donation.text || 'Donate:';
const getCollective = pkgPath => new Promise(function ($return, $error) {
  let pkg, url, baseCollective, logoUrl, promises, _ref, _ref2, stats, logo;

  pkg = fetchPkg(pkgPath);
  url = collectiveUrl(pkg);
  baseCollective = {
    url,
    slug: collectiveSlugFromUrl(url),
    logoUrl: collectiveLogoUrl(pkg),
    donationUrl: collectiveDonationUrl(pkg),
    donationText: collectiveDonationText(pkg)
  };
  logoUrl = baseCollective.logoUrl;
  promises = [fetchStats(url)].concat(logoUrl ? fetchLogo(logoUrl) : []);
  return Promise.resolve(Promise.all(promises)).then(function ($await_1) {
    try {
      _ref = $await_1, _ref2 = _slicedToArray(_ref, 2), stats = _ref2[0], logo = _ref2[1];
      return $return(Object.assign(baseCollective, {
        stats,
        logo
      }));
    } catch ($boundEx) {
      return $error($boundEx);
    }
  }, $error);
});
const collectiveDonationUrl = pkg => {
  const defaultDonationAmount = pkg.collective.donation && pkg.collective.donation.amount;
  let donateUrl = `${collectiveUrl(pkg)}/${retrieveDonationSlug(pkg)}`;

  if (defaultDonationAmount) {
    return `${donateUrl}/${defaultDonationAmount}`;
  }

  return donateUrl;
};
const retrieveDonationSlug = pkg => {
  const rawDonationSlug = pkg.collective.donation && pkg.collective.donation.slug;

  if (!rawDonationSlug) {
    return 'donate';
  }

  return stripLeadingSlash(rawDonationSlug);
};

function init(path$$1, hide = hideMessage()) {
  return new Promise(function ($return, $error) {
    let collective;

    if (hide) {
      return $return();
    }

    global.fetch = global.fetch || fetch;
    return Promise.resolve(getCollective(path$$1)).then(function ($await_1) {
      try {
        collective = $await_1;
        printLogo(collective.logo);
        printFooter(collective);
        return $return();
      } catch ($boundEx) {
        return $error($boundEx);
      }
    }, $error);
  });
}

exports.init = init;
