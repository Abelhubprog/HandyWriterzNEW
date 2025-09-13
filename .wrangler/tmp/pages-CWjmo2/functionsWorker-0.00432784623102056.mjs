var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../.wrangler/tmp/bundle-xLLS1Y/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  "../.wrangler/tmp/bundle-xLLS1Y/checked-fetch.js"() {
    "use strict";
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-3TMSNP4L.mjs
var init_chunk_3TMSNP4L = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-3TMSNP4L.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-I6MTSTOF.mjs
var LEGACY_DEV_INSTANCE_SUFFIXES, CURRENT_DEV_INSTANCE_SUFFIXES, DEV_OR_STAGING_SUFFIXES;
var init_chunk_I6MTSTOF = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-I6MTSTOF.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    LEGACY_DEV_INSTANCE_SUFFIXES = [".lcl.dev", ".lclstage.dev", ".lclclerk.com"];
    CURRENT_DEV_INSTANCE_SUFFIXES = [".accounts.dev", ".accountsstage.dev", ".accounts.lclclerk.com"];
    DEV_OR_STAGING_SUFFIXES = [
      ".lcl.dev",
      ".stg.dev",
      ".lclstage.dev",
      ".stgstage.dev",
      ".dev.lclclerk.com",
      ".stg.lclclerk.com",
      ".accounts.lclclerk.com",
      "accountsstage.dev",
      "accounts.dev"
    ];
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-IFTVZ2LQ.mjs
function isLegacyDevAccountPortalOrigin(host) {
  return LEGACY_DEV_INSTANCE_SUFFIXES.some((legacyDevSuffix) => {
    return host.startsWith("accounts.") && host.endsWith(legacyDevSuffix);
  });
}
function isCurrentDevAccountPortalOrigin(host) {
  return CURRENT_DEV_INSTANCE_SUFFIXES.some((currentDevSuffix) => {
    return host.endsWith(currentDevSuffix) && !host.endsWith(".clerk" + currentDevSuffix);
  });
}
var init_chunk_IFTVZ2LQ = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-IFTVZ2LQ.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_3TMSNP4L();
    init_chunk_I6MTSTOF();
    __name(isLegacyDevAccountPortalOrigin, "isLegacyDevAccountPortalOrigin");
    __name(isCurrentDevAccountPortalOrigin, "isCurrentDevAccountPortalOrigin");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-7ELT755Q.mjs
var __typeError, __accessCheck, __privateGet, __privateAdd, __privateSet, __privateMethod;
var init_chunk_7ELT755Q = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-7ELT755Q.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    __typeError = /* @__PURE__ */ __name((msg) => {
      throw TypeError(msg);
    }, "__typeError");
    __accessCheck = /* @__PURE__ */ __name((obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg), "__accessCheck");
    __privateGet = /* @__PURE__ */ __name((obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj)), "__privateGet");
    __privateAdd = /* @__PURE__ */ __name((obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value), "__privateAdd");
    __privateSet = /* @__PURE__ */ __name((obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value), "__privateSet");
    __privateMethod = /* @__PURE__ */ __name((obj, member, method) => (__accessCheck(obj, member, "access private method"), method), "__privateMethod");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/url.mjs
var init_url = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/url.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_IFTVZ2LQ();
    init_chunk_3TMSNP4L();
    init_chunk_I6MTSTOF();
    init_chunk_7ELT755Q();
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-N2V3PKFE.mjs
var defaultOptions, RETRY_IMMEDIATELY_DELAY, sleep, applyJitter, createExponentialDelayAsyncFn, retry;
var init_chunk_N2V3PKFE = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-N2V3PKFE.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    defaultOptions = {
      initialDelay: 125,
      maxDelayBetweenRetries: 0,
      factor: 2,
      shouldRetry: /* @__PURE__ */ __name((_2, iteration) => iteration < 5, "shouldRetry"),
      retryImmediately: false,
      jitter: true
    };
    RETRY_IMMEDIATELY_DELAY = 100;
    sleep = /* @__PURE__ */ __name(async (ms) => new Promise((s2) => setTimeout(s2, ms)), "sleep");
    applyJitter = /* @__PURE__ */ __name((delay, jitter) => {
      return jitter ? delay * (1 + Math.random()) : delay;
    }, "applyJitter");
    createExponentialDelayAsyncFn = /* @__PURE__ */ __name((opts) => {
      let timesCalled = 0;
      const calculateDelayInMs = /* @__PURE__ */ __name(() => {
        const constant = opts.initialDelay;
        const base = opts.factor;
        let delay = constant * Math.pow(base, timesCalled);
        delay = applyJitter(delay, opts.jitter);
        return Math.min(opts.maxDelayBetweenRetries || delay, delay);
      }, "calculateDelayInMs");
      return async () => {
        await sleep(calculateDelayInMs());
        timesCalled++;
      };
    }, "createExponentialDelayAsyncFn");
    retry = /* @__PURE__ */ __name(async (callback, options = {}) => {
      let iterations = 0;
      const { shouldRetry, initialDelay, maxDelayBetweenRetries, factor, retryImmediately, jitter } = {
        ...defaultOptions,
        ...options
      };
      const delay = createExponentialDelayAsyncFn({
        initialDelay,
        maxDelayBetweenRetries,
        factor,
        jitter
      });
      while (true) {
        try {
          return await callback();
        } catch (e) {
          iterations++;
          if (!shouldRetry(e, iterations)) {
            throw e;
          }
          if (retryImmediately && iterations === 1) {
            await sleep(applyJitter(RETRY_IMMEDIATELY_DELAY, jitter));
          } else {
            await delay();
          }
        }
      }
    }, "retry");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/retry.mjs
var init_retry = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/retry.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_N2V3PKFE();
    init_chunk_7ELT755Q();
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-TETGTEI2.mjs
var isomorphicAtob;
var init_chunk_TETGTEI2 = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-TETGTEI2.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    isomorphicAtob = /* @__PURE__ */ __name((data) => {
      if (typeof atob !== "undefined" && typeof atob === "function") {
        return atob(data);
      } else if (typeof global !== "undefined" && global.Buffer) {
        return new global.Buffer(data, "base64").toString();
      }
      return data;
    }, "isomorphicAtob");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-KOH7GTJO.mjs
var isomorphicBtoa;
var init_chunk_KOH7GTJO = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-KOH7GTJO.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    isomorphicBtoa = /* @__PURE__ */ __name((data) => {
      if (typeof btoa !== "undefined" && typeof btoa === "function") {
        return btoa(data);
      } else if (typeof global !== "undefined" && global.Buffer) {
        return new global.Buffer(data).toString("base64");
      }
      return data;
    }, "isomorphicBtoa");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-IV7BOO4U.mjs
function isValidDecodedPublishableKey(decoded) {
  if (!decoded.endsWith("$")) {
    return false;
  }
  const withoutTrailing = decoded.slice(0, -1);
  if (withoutTrailing.includes("$")) {
    return false;
  }
  return withoutTrailing.includes(".");
}
function parsePublishableKey(key, options = {}) {
  key = key || "";
  if (!key || !isPublishableKey(key)) {
    if (options.fatal && !key) {
      throw new Error(
        "Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys"
      );
    }
    if (options.fatal && !isPublishableKey(key)) {
      throw new Error("Publishable key not valid.");
    }
    return null;
  }
  const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? "production" : "development";
  let decodedFrontendApi;
  try {
    decodedFrontendApi = isomorphicAtob(key.split("_")[2]);
  } catch {
    if (options.fatal) {
      throw new Error("Publishable key not valid: Failed to decode key.");
    }
    return null;
  }
  if (!isValidDecodedPublishableKey(decodedFrontendApi)) {
    if (options.fatal) {
      throw new Error("Publishable key not valid: Decoded key has invalid format.");
    }
    return null;
  }
  let frontendApi = decodedFrontendApi.slice(0, -1);
  if (options.proxyUrl) {
    frontendApi = options.proxyUrl;
  } else if (instanceType !== "development" && options.domain && options.isSatellite) {
    frontendApi = `clerk.${options.domain}`;
  }
  return {
    instanceType,
    frontendApi
  };
}
function isPublishableKey(key = "") {
  try {
    const hasValidPrefix = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) || key.startsWith(PUBLISHABLE_KEY_TEST_PREFIX);
    if (!hasValidPrefix) {
      return false;
    }
    const parts = key.split("_");
    if (parts.length !== 3) {
      return false;
    }
    const encodedPart = parts[2];
    if (!encodedPart) {
      return false;
    }
    const decoded = isomorphicAtob(encodedPart);
    return isValidDecodedPublishableKey(decoded);
  } catch {
    return false;
  }
}
function createDevOrStagingUrlCache() {
  const devOrStagingUrlCache = /* @__PURE__ */ new Map();
  return {
    /**
     * Checks if a URL is a development or staging environment.
     *
     * @param url - The URL to check (string or URL object).
     * @returns `true` if the URL is a development or staging environment, `false` otherwise.
     */
    isDevOrStagingUrl: /* @__PURE__ */ __name((url) => {
      if (!url) {
        return false;
      }
      const hostname = typeof url === "string" ? url : url.hostname;
      let res = devOrStagingUrlCache.get(hostname);
      if (res === void 0) {
        res = DEV_OR_STAGING_SUFFIXES.some((s2) => hostname.endsWith(s2));
        devOrStagingUrlCache.set(hostname, res);
      }
      return res;
    }, "isDevOrStagingUrl")
  };
}
function isDevelopmentFromSecretKey(apiKey) {
  return apiKey.startsWith("test_") || apiKey.startsWith("sk_test_");
}
async function getCookieSuffix(publishableKey, subtle = globalThis.crypto.subtle) {
  const data = new TextEncoder().encode(publishableKey);
  const digest = await subtle.digest("sha-1", data);
  const stringDigest = String.fromCharCode(...new Uint8Array(digest));
  return isomorphicBtoa(stringDigest).replace(/\+/gi, "-").replace(/\//gi, "_").substring(0, 8);
}
var PUBLISHABLE_KEY_LIVE_PREFIX, PUBLISHABLE_KEY_TEST_PREFIX, getSuffixedCookieName;
var init_chunk_IV7BOO4U = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-IV7BOO4U.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_TETGTEI2();
    init_chunk_KOH7GTJO();
    init_chunk_I6MTSTOF();
    PUBLISHABLE_KEY_LIVE_PREFIX = "pk_live_";
    PUBLISHABLE_KEY_TEST_PREFIX = "pk_test_";
    __name(isValidDecodedPublishableKey, "isValidDecodedPublishableKey");
    __name(parsePublishableKey, "parsePublishableKey");
    __name(isPublishableKey, "isPublishableKey");
    __name(createDevOrStagingUrlCache, "createDevOrStagingUrlCache");
    __name(isDevelopmentFromSecretKey, "isDevelopmentFromSecretKey");
    __name(getCookieSuffix, "getCookieSuffix");
    getSuffixedCookieName = /* @__PURE__ */ __name((cookieName, cookieSuffix) => {
      return `${cookieName}_${cookieSuffix}`;
    }, "getSuffixedCookieName");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/keys.mjs
var init_keys = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/keys.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_IV7BOO4U();
    init_chunk_TETGTEI2();
    init_chunk_KOH7GTJO();
    init_chunk_I6MTSTOF();
    init_chunk_7ELT755Q();
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-7HPDNZ3R.mjs
var isTestEnvironment, isProductionEnvironment;
var init_chunk_7HPDNZ3R = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-7HPDNZ3R.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    isTestEnvironment = /* @__PURE__ */ __name(() => {
      try {
        return false;
      } catch {
      }
      return false;
    }, "isTestEnvironment");
    isProductionEnvironment = /* @__PURE__ */ __name(() => {
      try {
        return false;
      } catch {
      }
      return false;
    }, "isProductionEnvironment");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-UEY4AZIP.mjs
var displayedWarnings, deprecated;
var init_chunk_UEY4AZIP = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-UEY4AZIP.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_7HPDNZ3R();
    displayedWarnings = /* @__PURE__ */ new Set();
    deprecated = /* @__PURE__ */ __name((fnName, warning, key) => {
      const hideWarning = isTestEnvironment() || isProductionEnvironment();
      const messageId = key ?? fnName;
      if (displayedWarnings.has(messageId) || hideWarning) {
        return;
      }
      displayedWarnings.add(messageId);
      console.warn(
        `Clerk - DEPRECATION WARNING: "${fnName}" is deprecated and will be removed in the next major release.
${warning}`
      );
    }, "deprecated");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/deprecated.mjs
var init_deprecated = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/deprecated.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_UEY4AZIP();
    init_chunk_7HPDNZ3R();
    init_chunk_7ELT755Q();
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-IQKZKT6G.mjs
function isClerkAPIResponseError(err) {
  return err && "clerkError" in err;
}
function parseErrors(data = []) {
  return data.length > 0 ? data.map(parseError) : [];
}
function parseError(error) {
  return {
    code: error.code,
    message: error.message,
    longMessage: error.long_message,
    meta: {
      paramName: error?.meta?.param_name,
      sessionId: error?.meta?.session_id,
      emailAddresses: error?.meta?.email_addresses,
      identifiers: error?.meta?.identifiers,
      zxcvbn: error?.meta?.zxcvbn,
      plan: error?.meta?.plan,
      isPlanUpgradePossible: error?.meta?.is_plan_upgrade_possible
    }
  };
}
function buildErrorThrower({ packageName, customMessages }) {
  let pkg = packageName;
  function buildMessage(rawMessage, replacements) {
    if (!replacements) {
      return `${pkg}: ${rawMessage}`;
    }
    let msg = rawMessage;
    const matches2 = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);
    for (const match3 of matches2) {
      const replacement = (replacements[match3[1]] || "").toString();
      msg = msg.replace(`{{${match3[1]}}}`, replacement);
    }
    return `${pkg}: ${msg}`;
  }
  __name(buildMessage, "buildMessage");
  const messages = {
    ...DefaultMessages,
    ...customMessages
  };
  return {
    setPackageName({ packageName: packageName2 }) {
      if (typeof packageName2 === "string") {
        pkg = packageName2;
      }
      return this;
    },
    setMessages({ customMessages: customMessages2 }) {
      Object.assign(messages, customMessages2 || {});
      return this;
    },
    throwInvalidPublishableKeyError(params) {
      throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
    },
    throwInvalidProxyUrl(params) {
      throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
    },
    throwMissingPublishableKeyError() {
      throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
    },
    throwMissingSecretKeyError() {
      throw new Error(buildMessage(messages.MissingSecretKeyErrorMessage));
    },
    throwMissingClerkProviderError(params) {
      throw new Error(buildMessage(messages.MissingClerkProvider, params));
    },
    throw(message) {
      throw new Error(buildMessage(message));
    }
  };
}
var ClerkAPIResponseError, DefaultMessages;
var init_chunk_IQKZKT6G = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-IQKZKT6G.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    __name(isClerkAPIResponseError, "isClerkAPIResponseError");
    __name(parseErrors, "parseErrors");
    __name(parseError, "parseError");
    ClerkAPIResponseError = class _ClerkAPIResponseError extends Error {
      static {
        __name(this, "_ClerkAPIResponseError");
      }
      constructor(message, { data, status, clerkTraceId, retryAfter }) {
        super(message);
        this.toString = () => {
          let message2 = `[${this.name}]
Message:${this.message}
Status:${this.status}
Serialized errors: ${this.errors.map(
            (e) => JSON.stringify(e)
          )}`;
          if (this.clerkTraceId) {
            message2 += `
Clerk Trace ID: ${this.clerkTraceId}`;
          }
          return message2;
        };
        Object.setPrototypeOf(this, _ClerkAPIResponseError.prototype);
        this.status = status;
        this.message = message;
        this.clerkTraceId = clerkTraceId;
        this.retryAfter = retryAfter;
        this.clerkError = true;
        this.errors = parseErrors(data);
      }
    };
    DefaultMessages = Object.freeze({
      InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
      InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
      MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
      MissingSecretKeyErrorMessage: `Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
      MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`
    });
    __name(buildErrorThrower, "buildErrorThrower");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/error.mjs
var init_error = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/error.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_IQKZKT6G();
    init_chunk_7ELT755Q();
  }
});

// ../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-LWOXHF4E.mjs
var errorThrower, isDevOrStagingUrl;
var init_chunk_LWOXHF4E = __esm({
  "../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-LWOXHF4E.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_url();
    init_retry();
    init_keys();
    init_deprecated();
    init_error();
    init_keys();
    errorThrower = buildErrorThrower({ packageName: "@clerk/backend" });
    ({ isDevOrStagingUrl } = createDevOrStagingUrlCache());
  }
});

// ../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-YW6OOOXM.mjs
var TokenVerificationErrorCode, TokenVerificationErrorReason, TokenVerificationErrorAction, TokenVerificationError, MachineTokenVerificationErrorCode, MachineTokenVerificationError;
var init_chunk_YW6OOOXM = __esm({
  "../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-YW6OOOXM.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    TokenVerificationErrorCode = {
      InvalidSecretKey: "clerk_key_invalid"
    };
    TokenVerificationErrorReason = {
      TokenExpired: "token-expired",
      TokenInvalid: "token-invalid",
      TokenInvalidAlgorithm: "token-invalid-algorithm",
      TokenInvalidAuthorizedParties: "token-invalid-authorized-parties",
      TokenInvalidSignature: "token-invalid-signature",
      TokenNotActiveYet: "token-not-active-yet",
      TokenIatInTheFuture: "token-iat-in-the-future",
      TokenVerificationFailed: "token-verification-failed",
      InvalidSecretKey: "secret-key-invalid",
      LocalJWKMissing: "jwk-local-missing",
      RemoteJWKFailedToLoad: "jwk-remote-failed-to-load",
      RemoteJWKInvalid: "jwk-remote-invalid",
      RemoteJWKMissing: "jwk-remote-missing",
      JWKFailedToResolve: "jwk-failed-to-resolve",
      JWKKidMismatch: "jwk-kid-mismatch"
    };
    TokenVerificationErrorAction = {
      ContactSupport: "Contact support@clerk.com",
      EnsureClerkJWT: "Make sure that this is a valid Clerk generate JWT.",
      SetClerkJWTKey: "Set the CLERK_JWT_KEY environment variable.",
      SetClerkSecretKey: "Set the CLERK_SECRET_KEY environment variable.",
      EnsureClockSync: "Make sure your system clock is in sync (e.g. turn off and on automatic time synchronization)."
    };
    TokenVerificationError = class _TokenVerificationError extends Error {
      static {
        __name(this, "_TokenVerificationError");
      }
      constructor({
        action,
        message,
        reason
      }) {
        super(message);
        Object.setPrototypeOf(this, _TokenVerificationError.prototype);
        this.reason = reason;
        this.message = message;
        this.action = action;
      }
      getFullMessage() {
        return `${[this.message, this.action].filter((m) => m).join(" ")} (reason=${this.reason}, token-carrier=${this.tokenCarrier})`;
      }
    };
    MachineTokenVerificationErrorCode = {
      TokenInvalid: "token-invalid",
      InvalidSecretKey: "secret-key-invalid",
      UnexpectedError: "unexpected-error"
    };
    MachineTokenVerificationError = class _MachineTokenVerificationError extends Error {
      static {
        __name(this, "_MachineTokenVerificationError");
      }
      constructor({ message, code, status }) {
        super(message);
        Object.setPrototypeOf(this, _MachineTokenVerificationError.prototype);
        this.code = code;
        this.status = status;
      }
      getFullMessage() {
        return `${this.message} (code=${this.code}, status=${this.status})`;
      }
    };
  }
});

// ../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/runtime/browser/crypto.mjs
var webcrypto;
var init_crypto = __esm({
  "../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/runtime/browser/crypto.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    webcrypto = crypto;
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/isomorphicAtob.mjs
var init_isomorphicAtob = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/isomorphicAtob.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_TETGTEI2();
    init_chunk_7ELT755Q();
  }
});

// ../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-XJ4RTXJG.mjs
function parse(string, encoding, opts = {}) {
  if (!encoding.codes) {
    encoding.codes = {};
    for (let i = 0; i < encoding.chars.length; ++i) {
      encoding.codes[encoding.chars[i]] = i;
    }
  }
  if (!opts.loose && string.length * encoding.bits & 7) {
    throw new SyntaxError("Invalid padding");
  }
  let end = string.length;
  while (string[end - 1] === "=") {
    --end;
    if (!opts.loose && !((string.length - end) * encoding.bits & 7)) {
      throw new SyntaxError("Invalid padding");
    }
  }
  const out = new (opts.out ?? Uint8Array)(end * encoding.bits / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = encoding.codes[string[i]];
    if (value === void 0) {
      throw new SyntaxError("Invalid character " + string[i]);
    }
    buffer = buffer << encoding.bits | value;
    bits += encoding.bits;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 255 & buffer >> bits;
    }
  }
  if (bits >= encoding.bits || 255 & buffer << 8 - bits) {
    throw new SyntaxError("Unexpected end of data");
  }
  return out;
}
function stringify(data, encoding, opts = {}) {
  const { pad = true } = opts;
  const mask = (1 << encoding.bits) - 1;
  let out = "";
  let bits = 0;
  let buffer = 0;
  for (let i = 0; i < data.length; ++i) {
    buffer = buffer << 8 | 255 & data[i];
    bits += 8;
    while (bits > encoding.bits) {
      bits -= encoding.bits;
      out += encoding.chars[mask & buffer >> bits];
    }
  }
  if (bits) {
    out += encoding.chars[mask & buffer << encoding.bits - bits];
  }
  if (pad) {
    while (out.length * encoding.bits & 7) {
      out += "=";
    }
  }
  return out;
}
function getCryptoAlgorithm(algorithmName) {
  const hash = algToHash[algorithmName];
  const name = jwksAlgToCryptoAlg[algorithmName];
  if (!hash || !name) {
    throw new Error(`Unsupported algorithm ${algorithmName}, expected one of ${algs.join(",")}.`);
  }
  return {
    hash: { name: algToHash[algorithmName] },
    name: jwksAlgToCryptoAlg[algorithmName]
  };
}
function pemToBuffer(secret) {
  const trimmed = secret.replace(/-----BEGIN.*?-----/g, "").replace(/-----END.*?-----/g, "").replace(/\s/g, "");
  const decoded = isomorphicAtob(trimmed);
  const buffer = new ArrayBuffer(decoded.length);
  const bufView = new Uint8Array(buffer);
  for (let i = 0, strLen = decoded.length; i < strLen; i++) {
    bufView[i] = decoded.charCodeAt(i);
  }
  return bufView;
}
function importKey(key, algorithm, keyUsage) {
  if (typeof key === "object") {
    return runtime.crypto.subtle.importKey("jwk", key, algorithm, false, [keyUsage]);
  }
  const keyData = pemToBuffer(key);
  const format = keyUsage === "sign" ? "pkcs8" : "spki";
  return runtime.crypto.subtle.importKey(format, keyData, algorithm, false, [keyUsage]);
}
async function hasValidSignature(jwt, key) {
  const { header, signature, raw } = jwt;
  const encoder = new TextEncoder();
  const data = encoder.encode([raw.header, raw.payload].join("."));
  const algorithm = getCryptoAlgorithm(header.alg);
  try {
    const cryptoKey = await importKey(key, algorithm, "verify");
    const verified = await runtime.crypto.subtle.verify(algorithm.name, cryptoKey, signature, data);
    return { data: verified };
  } catch (error) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalidSignature,
          message: error?.message
        })
      ]
    };
  }
}
function decodeJwt(token) {
  const tokenParts = (token || "").toString().split(".");
  if (tokenParts.length !== 3) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalid,
          message: `Invalid JWT form. A JWT consists of three parts separated by dots.`
        })
      ]
    };
  }
  const [rawHeader, rawPayload, rawSignature] = tokenParts;
  const decoder = new TextDecoder();
  const header = JSON.parse(decoder.decode(base64url.parse(rawHeader, { loose: true })));
  const payload = JSON.parse(decoder.decode(base64url.parse(rawPayload, { loose: true })));
  const signature = base64url.parse(rawSignature, { loose: true });
  const data = {
    header,
    payload,
    signature,
    raw: {
      header: rawHeader,
      payload: rawPayload,
      signature: rawSignature,
      text: token
    }
  };
  return { data };
}
async function verifyJwt(token, options) {
  const { audience, authorizedParties, clockSkewInMs, key } = options;
  const clockSkew = clockSkewInMs || DEFAULT_CLOCK_SKEW_IN_MS;
  const { data: decoded, errors } = decodeJwt(token);
  if (errors) {
    return { errors };
  }
  const { header, payload } = decoded;
  try {
    const { typ, alg } = header;
    assertHeaderType(typ);
    assertHeaderAlgorithm(alg);
    const { azp, sub, aud, iat, exp, nbf } = payload;
    assertSubClaim(sub);
    assertAudienceClaim([aud], [audience]);
    assertAuthorizedPartiesClaim(azp, authorizedParties);
    assertExpirationClaim(exp, clockSkew);
    assertActivationClaim(nbf, clockSkew);
    assertIssuedAtClaim(iat, clockSkew);
  } catch (err) {
    return { errors: [err] };
  }
  const { data: signatureValid, errors: signatureErrors } = await hasValidSignature(decoded, key);
  if (signatureErrors) {
    return {
      errors: [
        new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenVerificationFailed,
          message: `Error verifying JWT signature. ${signatureErrors[0]}`
        })
      ]
    };
  }
  if (!signatureValid) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalidSignature,
          message: "JWT signature is invalid."
        })
      ]
    };
  }
  return { data: payload };
}
var globalFetch, runtime, base64url, base64UrlEncoding, algToHash, RSA_ALGORITHM_NAME, jwksAlgToCryptoAlg, algs, isArrayString, assertAudienceClaim, assertHeaderType, assertHeaderAlgorithm, assertSubClaim, assertAuthorizedPartiesClaim, assertExpirationClaim, assertActivationClaim, assertIssuedAtClaim, DEFAULT_CLOCK_SKEW_IN_MS;
var init_chunk_XJ4RTXJG = __esm({
  "../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-XJ4RTXJG.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_YW6OOOXM();
    init_crypto();
    init_isomorphicAtob();
    globalFetch = fetch.bind(globalThis);
    runtime = {
      crypto: webcrypto,
      get fetch() {
        return false ? fetch : globalFetch;
      },
      AbortController: globalThis.AbortController,
      Blob: globalThis.Blob,
      FormData: globalThis.FormData,
      Headers: globalThis.Headers,
      Request: globalThis.Request,
      Response: globalThis.Response
    };
    base64url = {
      parse(string, opts) {
        return parse(string, base64UrlEncoding, opts);
      },
      stringify(data, opts) {
        return stringify(data, base64UrlEncoding, opts);
      }
    };
    base64UrlEncoding = {
      chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
      bits: 6
    };
    __name(parse, "parse");
    __name(stringify, "stringify");
    algToHash = {
      RS256: "SHA-256",
      RS384: "SHA-384",
      RS512: "SHA-512"
    };
    RSA_ALGORITHM_NAME = "RSASSA-PKCS1-v1_5";
    jwksAlgToCryptoAlg = {
      RS256: RSA_ALGORITHM_NAME,
      RS384: RSA_ALGORITHM_NAME,
      RS512: RSA_ALGORITHM_NAME
    };
    algs = Object.keys(algToHash);
    __name(getCryptoAlgorithm, "getCryptoAlgorithm");
    isArrayString = /* @__PURE__ */ __name((s2) => {
      return Array.isArray(s2) && s2.length > 0 && s2.every((a) => typeof a === "string");
    }, "isArrayString");
    assertAudienceClaim = /* @__PURE__ */ __name((aud, audience) => {
      const audienceList = [audience].flat().filter((a) => !!a);
      const audList = [aud].flat().filter((a) => !!a);
      const shouldVerifyAudience = audienceList.length > 0 && audList.length > 0;
      if (!shouldVerifyAudience) {
        return;
      }
      if (typeof aud === "string") {
        if (!audienceList.includes(aud)) {
          throw new TokenVerificationError({
            action: TokenVerificationErrorAction.EnsureClerkJWT,
            reason: TokenVerificationErrorReason.TokenVerificationFailed,
            message: `Invalid JWT audience claim (aud) ${JSON.stringify(aud)}. Is not included in "${JSON.stringify(
              audienceList
            )}".`
          });
        }
      } else if (isArrayString(aud)) {
        if (!aud.some((a) => audienceList.includes(a))) {
          throw new TokenVerificationError({
            action: TokenVerificationErrorAction.EnsureClerkJWT,
            reason: TokenVerificationErrorReason.TokenVerificationFailed,
            message: `Invalid JWT audience claim array (aud) ${JSON.stringify(aud)}. Is not included in "${JSON.stringify(
              audienceList
            )}".`
          });
        }
      }
    }, "assertAudienceClaim");
    assertHeaderType = /* @__PURE__ */ __name((typ) => {
      if (typeof typ === "undefined") {
        return;
      }
      if (typ !== "JWT") {
        throw new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenInvalid,
          message: `Invalid JWT type ${JSON.stringify(typ)}. Expected "JWT".`
        });
      }
    }, "assertHeaderType");
    assertHeaderAlgorithm = /* @__PURE__ */ __name((alg) => {
      if (!algs.includes(alg)) {
        throw new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenInvalidAlgorithm,
          message: `Invalid JWT algorithm ${JSON.stringify(alg)}. Supported: ${algs}.`
        });
      }
    }, "assertHeaderAlgorithm");
    assertSubClaim = /* @__PURE__ */ __name((sub) => {
      if (typeof sub !== "string") {
        throw new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenVerificationFailed,
          message: `Subject claim (sub) is required and must be a string. Received ${JSON.stringify(sub)}.`
        });
      }
    }, "assertSubClaim");
    assertAuthorizedPartiesClaim = /* @__PURE__ */ __name((azp, authorizedParties) => {
      if (!azp || !authorizedParties || authorizedParties.length === 0) {
        return;
      }
      if (!authorizedParties.includes(azp)) {
        throw new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalidAuthorizedParties,
          message: `Invalid JWT Authorized party claim (azp) ${JSON.stringify(azp)}. Expected "${authorizedParties}".`
        });
      }
    }, "assertAuthorizedPartiesClaim");
    assertExpirationClaim = /* @__PURE__ */ __name((exp, clockSkewInMs) => {
      if (typeof exp !== "number") {
        throw new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenVerificationFailed,
          message: `Invalid JWT expiry date claim (exp) ${JSON.stringify(exp)}. Expected number.`
        });
      }
      const currentDate = new Date(Date.now());
      const expiryDate = /* @__PURE__ */ new Date(0);
      expiryDate.setUTCSeconds(exp);
      const expired = expiryDate.getTime() <= currentDate.getTime() - clockSkewInMs;
      if (expired) {
        throw new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenExpired,
          message: `JWT is expired. Expiry date: ${expiryDate.toUTCString()}, Current date: ${currentDate.toUTCString()}.`
        });
      }
    }, "assertExpirationClaim");
    assertActivationClaim = /* @__PURE__ */ __name((nbf, clockSkewInMs) => {
      if (typeof nbf === "undefined") {
        return;
      }
      if (typeof nbf !== "number") {
        throw new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenVerificationFailed,
          message: `Invalid JWT not before date claim (nbf) ${JSON.stringify(nbf)}. Expected number.`
        });
      }
      const currentDate = new Date(Date.now());
      const notBeforeDate = /* @__PURE__ */ new Date(0);
      notBeforeDate.setUTCSeconds(nbf);
      const early = notBeforeDate.getTime() > currentDate.getTime() + clockSkewInMs;
      if (early) {
        throw new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenNotActiveYet,
          message: `JWT cannot be used prior to not before date claim (nbf). Not before date: ${notBeforeDate.toUTCString()}; Current date: ${currentDate.toUTCString()};`
        });
      }
    }, "assertActivationClaim");
    assertIssuedAtClaim = /* @__PURE__ */ __name((iat, clockSkewInMs) => {
      if (typeof iat === "undefined") {
        return;
      }
      if (typeof iat !== "number") {
        throw new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenVerificationFailed,
          message: `Invalid JWT issued at date claim (iat) ${JSON.stringify(iat)}. Expected number.`
        });
      }
      const currentDate = new Date(Date.now());
      const issuedAtDate = /* @__PURE__ */ new Date(0);
      issuedAtDate.setUTCSeconds(iat);
      const postIssued = issuedAtDate.getTime() > currentDate.getTime() + clockSkewInMs;
      if (postIssued) {
        throw new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenIatInTheFuture,
          message: `JWT issued at date claim (iat) is in the future. Issued at date: ${issuedAtDate.toUTCString()}; Current date: ${currentDate.toUTCString()};`
        });
      }
    }, "assertIssuedAtClaim");
    __name(pemToBuffer, "pemToBuffer");
    __name(importKey, "importKey");
    DEFAULT_CLOCK_SKEW_IN_MS = 5 * 1e3;
    __name(hasValidSignature, "hasValidSignature");
    __name(decodeJwt, "decodeJwt");
    __name(verifyJwt, "verifyJwt");
  }
});

// ../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-RPS7XK5K.mjs
var __typeError2, __accessCheck2, __privateAdd2, __privateMethod2;
var init_chunk_RPS7XK5K = __esm({
  "../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-RPS7XK5K.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    __typeError2 = /* @__PURE__ */ __name((msg) => {
      throw TypeError(msg);
    }, "__typeError");
    __accessCheck2 = /* @__PURE__ */ __name((obj, member, msg) => member.has(obj) || __typeError2("Cannot " + msg), "__accessCheck");
    __privateAdd2 = /* @__PURE__ */ __name((obj, member, value) => member.has(obj) ? __typeError2("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value), "__privateAdd");
    __privateMethod2 = /* @__PURE__ */ __name((obj, member, method) => (__accessCheck2(obj, member, "access private method"), method), "__privateMethod");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/buildAccountsBaseUrl.mjs
function buildAccountsBaseUrl(frontendApi) {
  if (!frontendApi) {
    return "";
  }
  const accountsBaseUrl = frontendApi.replace(/clerk\.accountsstage\./, "accountsstage.").replace(/clerk\.accounts\.|clerk\./, "accounts.");
  return `https://${accountsBaseUrl}`;
}
var init_buildAccountsBaseUrl = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/buildAccountsBaseUrl.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_7ELT755Q();
    __name(buildAccountsBaseUrl, "buildAccountsBaseUrl");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-3CN5LOSN.mjs
var TYPES_TO_OBJECTS, ALLOWED_LEVELS, ALLOWED_TYPES, isValidMaxAge, isValidLevel, isValidVerificationType, prefixWithOrg, checkOrgAuthorization, checkForFeatureOrPlan, checkBillingAuthorization, splitByScope, validateReverificationConfig, checkReverificationAuthorization, createCheckAuthorization;
var init_chunk_3CN5LOSN = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-3CN5LOSN.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    TYPES_TO_OBJECTS = {
      strict_mfa: {
        afterMinutes: 10,
        level: "multi_factor"
      },
      strict: {
        afterMinutes: 10,
        level: "second_factor"
      },
      moderate: {
        afterMinutes: 60,
        level: "second_factor"
      },
      lax: {
        afterMinutes: 1440,
        level: "second_factor"
      }
    };
    ALLOWED_LEVELS = /* @__PURE__ */ new Set(["first_factor", "second_factor", "multi_factor"]);
    ALLOWED_TYPES = /* @__PURE__ */ new Set(["strict_mfa", "strict", "moderate", "lax"]);
    isValidMaxAge = /* @__PURE__ */ __name((maxAge) => typeof maxAge === "number" && maxAge > 0, "isValidMaxAge");
    isValidLevel = /* @__PURE__ */ __name((level) => ALLOWED_LEVELS.has(level), "isValidLevel");
    isValidVerificationType = /* @__PURE__ */ __name((type) => ALLOWED_TYPES.has(type), "isValidVerificationType");
    prefixWithOrg = /* @__PURE__ */ __name((value) => value.replace(/^(org:)*/, "org:"), "prefixWithOrg");
    checkOrgAuthorization = /* @__PURE__ */ __name((params, options) => {
      const { orgId, orgRole, orgPermissions } = options;
      if (!params.role && !params.permission) {
        return null;
      }
      if (!orgId || !orgRole || !orgPermissions) {
        return null;
      }
      if (params.permission) {
        return orgPermissions.includes(prefixWithOrg(params.permission));
      }
      if (params.role) {
        return prefixWithOrg(orgRole) === prefixWithOrg(params.role);
      }
      return null;
    }, "checkOrgAuthorization");
    checkForFeatureOrPlan = /* @__PURE__ */ __name((claim, featureOrPlan) => {
      const { org: orgFeatures, user: userFeatures } = splitByScope(claim);
      const [scope, _id] = featureOrPlan.split(":");
      const id = _id || scope;
      if (scope === "org") {
        return orgFeatures.includes(id);
      } else if (scope === "user") {
        return userFeatures.includes(id);
      } else {
        return [...orgFeatures, ...userFeatures].includes(id);
      }
    }, "checkForFeatureOrPlan");
    checkBillingAuthorization = /* @__PURE__ */ __name((params, options) => {
      const { features, plans } = options;
      if (params.feature && features) {
        return checkForFeatureOrPlan(features, params.feature);
      }
      if (params.plan && plans) {
        return checkForFeatureOrPlan(plans, params.plan);
      }
      return null;
    }, "checkBillingAuthorization");
    splitByScope = /* @__PURE__ */ __name((fea) => {
      const features = fea ? fea.split(",").map((f) => f.trim()) : [];
      return {
        org: features.filter((f) => f.split(":")[0].includes("o")).map((f) => f.split(":")[1]),
        user: features.filter((f) => f.split(":")[0].includes("u")).map((f) => f.split(":")[1])
      };
    }, "splitByScope");
    validateReverificationConfig = /* @__PURE__ */ __name((config) => {
      if (!config) {
        return false;
      }
      const convertConfigToObject = /* @__PURE__ */ __name((config2) => {
        if (typeof config2 === "string") {
          return TYPES_TO_OBJECTS[config2];
        }
        return config2;
      }, "convertConfigToObject");
      const isValidStringValue = typeof config === "string" && isValidVerificationType(config);
      const isValidObjectValue = typeof config === "object" && isValidLevel(config.level) && isValidMaxAge(config.afterMinutes);
      if (isValidStringValue || isValidObjectValue) {
        return convertConfigToObject.bind(null, config);
      }
      return false;
    }, "validateReverificationConfig");
    checkReverificationAuthorization = /* @__PURE__ */ __name((params, { factorVerificationAge }) => {
      if (!params.reverification || !factorVerificationAge) {
        return null;
      }
      const isValidReverification = validateReverificationConfig(params.reverification);
      if (!isValidReverification) {
        return null;
      }
      const { level, afterMinutes } = isValidReverification();
      const [factor1Age, factor2Age] = factorVerificationAge;
      const isValidFactor1 = factor1Age !== -1 ? afterMinutes > factor1Age : null;
      const isValidFactor2 = factor2Age !== -1 ? afterMinutes > factor2Age : null;
      switch (level) {
        case "first_factor":
          return isValidFactor1;
        case "second_factor":
          return factor2Age !== -1 ? isValidFactor2 : isValidFactor1;
        case "multi_factor":
          return factor2Age === -1 ? isValidFactor1 : isValidFactor1 && isValidFactor2;
      }
    }, "checkReverificationAuthorization");
    createCheckAuthorization = /* @__PURE__ */ __name((options) => {
      return (params) => {
        if (!options.userId) {
          return false;
        }
        const billingAuthorization = checkBillingAuthorization(params, options);
        const orgAuthorization = checkOrgAuthorization(params, options);
        const reverificationAuthorization = checkReverificationAuthorization(params, options);
        if ([billingAuthorization || orgAuthorization, reverificationAuthorization].some((a) => a === null)) {
          return [billingAuthorization || orgAuthorization, reverificationAuthorization].some((a) => a === true);
        }
        return [billingAuthorization || orgAuthorization, reverificationAuthorization].every((a) => a === true);
      };
    }, "createCheckAuthorization");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/authorization.mjs
var init_authorization = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/authorization.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_3CN5LOSN();
    init_chunk_7ELT755Q();
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/jwtPayloadParser.mjs
function buildOrgPermissions({
  features,
  permissions,
  featurePermissionMap
}) {
  if (!features || !permissions || !featurePermissionMap) {
    return [];
  }
  const orgPermissions = [];
  for (let featureIndex = 0; featureIndex < features.length; featureIndex++) {
    const feature = features[featureIndex];
    if (featureIndex >= featurePermissionMap.length) {
      continue;
    }
    const permissionBits = featurePermissionMap[featureIndex];
    if (!permissionBits) {
      continue;
    }
    for (let permIndex = 0; permIndex < permissionBits.length; permIndex++) {
      if (permissionBits[permIndex] === 1) {
        orgPermissions.push(`org:${feature}:${permissions[permIndex]}`);
      }
    }
  }
  return orgPermissions;
}
var parsePermissions, __experimental_JWTPayloadToAuthObjectProperties;
var init_jwtPayloadParser = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/jwtPayloadParser.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_3CN5LOSN();
    init_chunk_7ELT755Q();
    parsePermissions = /* @__PURE__ */ __name(({ per, fpm }) => {
      if (!per || !fpm) {
        return { permissions: [], featurePermissionMap: [] };
      }
      const permissions = per.split(",").map((p) => p.trim());
      const featurePermissionMap = fpm.split(",").map((permission) => Number.parseInt(permission.trim(), 10)).map(
        (permission) => permission.toString(2).padStart(permissions.length, "0").split("").map((bit) => Number.parseInt(bit, 10)).reverse()
      ).filter(Boolean);
      return { permissions, featurePermissionMap };
    }, "parsePermissions");
    __name(buildOrgPermissions, "buildOrgPermissions");
    __experimental_JWTPayloadToAuthObjectProperties = /* @__PURE__ */ __name((claims) => {
      let orgId;
      let orgRole;
      let orgSlug;
      let orgPermissions;
      const factorVerificationAge = claims.fva ?? null;
      const sessionStatus = claims.sts ?? null;
      switch (claims.v) {
        case 2: {
          if (claims.o) {
            orgId = claims.o?.id;
            orgSlug = claims.o?.slg;
            if (claims.o?.rol) {
              orgRole = `org:${claims.o?.rol}`;
            }
            const { org } = splitByScope(claims.fea);
            const { permissions, featurePermissionMap } = parsePermissions({
              per: claims.o?.per,
              fpm: claims.o?.fpm
            });
            orgPermissions = buildOrgPermissions({
              features: org,
              featurePermissionMap,
              permissions
            });
          }
          break;
        }
        default:
          orgId = claims.org_id;
          orgRole = claims.org_role;
          orgSlug = claims.org_slug;
          orgPermissions = claims.org_permissions;
          break;
      }
      return {
        sessionClaims: claims,
        sessionId: claims.sid,
        sessionStatus,
        actor: claims.act,
        userId: claims.sub,
        orgId,
        orgRole,
        orgSlug,
        orgPermissions,
        factorVerificationAge
      };
    }, "__experimental_JWTPayloadToAuthObjectProperties");
  }
});

// ../node_modules/.pnpm/cookie@1.0.2/node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "../node_modules/.pnpm/cookie@1.0.2/node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = parse4;
    exports.serialize = serialize;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = /* @__PURE__ */ __name(function() {
      }, "C");
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parse4(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1)
          break;
        const colonIdx = str.indexOf(";", index);
        const endIdx = colonIdx === -1 ? len : colonIdx;
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const keyStartIdx = startIndex(str, index, eqIdx);
        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        const key = str.slice(keyStartIdx, keyEndIdx);
        if (obj[key] === void 0) {
          let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
          let valEndIdx = endIndex(str, endIdx, valStartIdx);
          const value = dec(str.slice(valStartIdx, valEndIdx));
          obj[key] = value;
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    __name(parse4, "parse");
    function startIndex(str, index, max) {
      do {
        const code = str.charCodeAt(index);
        if (code !== 32 && code !== 9)
          return index;
      } while (++index < max);
      return max;
    }
    __name(startIndex, "startIndex");
    function endIndex(str, index, min) {
      while (index > min) {
        const code = str.charCodeAt(--index);
        if (code !== 32 && code !== 9)
          return index + 1;
      }
      return min;
    }
    __name(endIndex, "endIndex");
    function serialize(name, val, options) {
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`argument name is invalid: ${name}`);
      }
      const value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${val}`);
      }
      let str = name + "=" + value;
      if (!options)
        return str;
      if (options.maxAge !== void 0) {
        if (!Number.isInteger(options.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
        }
        str += "; Max-Age=" + options.maxAge;
      }
      if (options.domain) {
        if (!domainValueRegExp.test(options.domain)) {
          throw new TypeError(`option domain is invalid: ${options.domain}`);
        }
        str += "; Domain=" + options.domain;
      }
      if (options.path) {
        if (!pathValueRegExp.test(options.path)) {
          throw new TypeError(`option path is invalid: ${options.path}`);
        }
        str += "; Path=" + options.path;
      }
      if (options.expires) {
        if (!isDate(options.expires) || !Number.isFinite(options.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${options.expires}`);
        }
        str += "; Expires=" + options.expires.toUTCString();
      }
      if (options.httpOnly) {
        str += "; HttpOnly";
      }
      if (options.secure) {
        str += "; Secure";
      }
      if (options.partitioned) {
        str += "; Partitioned";
      }
      if (options.priority) {
        const priority = typeof options.priority === "string" ? options.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${options.priority}`);
        }
      }
      if (options.sameSite) {
        const sameSite = typeof options.sameSite === "string" ? options.sameSite.toLowerCase() : options.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
        }
      }
      return str;
    }
    __name(serialize, "serialize");
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    __name(decode, "decode");
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
    __name(isDate, "isDate");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-JJHTUJGL.mjs
function _(r) {
  for (var n = [], e = 0; e < r.length; ) {
    var a = r[e];
    if (a === "*" || a === "+" || a === "?") {
      n.push({
        type: "MODIFIER",
        index: e,
        value: r[e++]
      });
      continue;
    }
    if (a === "\\") {
      n.push({
        type: "ESCAPED_CHAR",
        index: e++,
        value: r[e++]
      });
      continue;
    }
    if (a === "{") {
      n.push({
        type: "OPEN",
        index: e,
        value: r[e++]
      });
      continue;
    }
    if (a === "}") {
      n.push({
        type: "CLOSE",
        index: e,
        value: r[e++]
      });
      continue;
    }
    if (a === ":") {
      for (var u = "", t = e + 1; t < r.length; ) {
        var c = r.charCodeAt(t);
        if (c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 95) {
          u += r[t++];
          continue;
        }
        break;
      }
      if (!u) throw new TypeError("Missing parameter name at ".concat(e));
      n.push({
        type: "NAME",
        index: e,
        value: u
      }), e = t;
      continue;
    }
    if (a === "(") {
      var o = 1, m = "", t = e + 1;
      if (r[t] === "?") throw new TypeError('Pattern cannot start with "?" at '.concat(t));
      for (; t < r.length; ) {
        if (r[t] === "\\") {
          m += r[t++] + r[t++];
          continue;
        }
        if (r[t] === ")") {
          if (o--, o === 0) {
            t++;
            break;
          }
        } else if (r[t] === "(" && (o++, r[t + 1] !== "?"))
          throw new TypeError("Capturing groups are not allowed at ".concat(t));
        m += r[t++];
      }
      if (o) throw new TypeError("Unbalanced pattern at ".concat(e));
      if (!m) throw new TypeError("Missing pattern at ".concat(e));
      n.push({
        type: "PATTERN",
        index: e,
        value: m
      }), e = t;
      continue;
    }
    n.push({
      type: "CHAR",
      index: e,
      value: r[e++]
    });
  }
  return n.push({
    type: "END",
    index: e,
    value: ""
  }), n;
}
function F(r, n) {
  n === void 0 && (n = {});
  for (var e = _(r), a = n.prefixes, u = a === void 0 ? "./" : a, t = n.delimiter, c = t === void 0 ? "/#?" : t, o = [], m = 0, h = 0, p = "", f = function(l) {
    if (h < e.length && e[h].type === l) return e[h++].value;
  }, w = function(l) {
    var v = f(l);
    if (v !== void 0) return v;
    var E = e[h], N = E.type, S = E.index;
    throw new TypeError("Unexpected ".concat(N, " at ").concat(S, ", expected ").concat(l));
  }, d = function() {
    for (var l = "", v; v = f("CHAR") || f("ESCAPED_CHAR"); ) l += v;
    return l;
  }, M = function(l) {
    for (var v = 0, E = c; v < E.length; v++) {
      var N = E[v];
      if (l.indexOf(N) > -1) return true;
    }
    return false;
  }, A = function(l) {
    var v = o[o.length - 1], E = l || (v && typeof v == "string" ? v : "");
    if (v && !E)
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(v.name, '"'));
    return !E || M(E) ? "[^".concat(s(c), "]+?") : "(?:(?!".concat(s(E), ")[^").concat(s(c), "])+?");
  }; h < e.length; ) {
    var T = f("CHAR"), x = f("NAME"), C = f("PATTERN");
    if (x || C) {
      var g = T || "";
      u.indexOf(g) === -1 && (p += g, g = ""), p && (o.push(p), p = ""), o.push({
        name: x || m++,
        prefix: g,
        suffix: "",
        pattern: C || A(g),
        modifier: f("MODIFIER") || ""
      });
      continue;
    }
    var i = T || f("ESCAPED_CHAR");
    if (i) {
      p += i;
      continue;
    }
    p && (o.push(p), p = "");
    var R = f("OPEN");
    if (R) {
      var g = d(), y = f("NAME") || "", O = f("PATTERN") || "", b = d();
      w("CLOSE"), o.push({
        name: y || (O ? m++ : ""),
        pattern: y && !O ? A(g) : O,
        prefix: g,
        suffix: b,
        modifier: f("MODIFIER") || ""
      });
      continue;
    }
    w("END");
  }
  return o;
}
function H(r, n) {
  var e = [], a = P(r, e, n);
  return I(a, e, n);
}
function I(r, n, e) {
  e === void 0 && (e = {});
  var a = e.decode, u = a === void 0 ? function(t) {
    return t;
  } : a;
  return function(t) {
    var c = r.exec(t);
    if (!c) return false;
    for (var o = c[0], m = c.index, h = /* @__PURE__ */ Object.create(null), p = function(w) {
      if (c[w] === void 0) return "continue";
      var d = n[w - 1];
      d.modifier === "*" || d.modifier === "+" ? h[d.name] = c[w].split(d.prefix + d.suffix).map(function(M) {
        return u(M, d);
      }) : h[d.name] = u(c[w], d);
    }, f = 1; f < c.length; f++)
      p(f);
    return {
      path: o,
      index: m,
      params: h
    };
  };
}
function s(r) {
  return r.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function D(r) {
  return r && r.sensitive ? "" : "i";
}
function $(r, n) {
  if (!n) return r;
  for (var e = /\((?:\?<(.*?)>)?(?!\?)/g, a = 0, u = e.exec(r.source); u; )
    n.push({
      name: u[1] || a++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    }), u = e.exec(r.source);
  return r;
}
function W(r, n, e) {
  var a = r.map(function(u) {
    return P(u, n, e).source;
  });
  return new RegExp("(?:".concat(a.join("|"), ")"), D(e));
}
function L(r, n, e) {
  return U(F(r, e), n, e);
}
function U(r, n, e) {
  e === void 0 && (e = {});
  for (var a = e.strict, u = a === void 0 ? false : a, t = e.start, c = t === void 0 ? true : t, o = e.end, m = o === void 0 ? true : o, h = e.encode, p = h === void 0 ? function(v) {
    return v;
  } : h, f = e.delimiter, w = f === void 0 ? "/#?" : f, d = e.endsWith, M = d === void 0 ? "" : d, A = "[".concat(s(M), "]|$"), T = "[".concat(s(w), "]"), x = c ? "^" : "", C = 0, g = r; C < g.length; C++) {
    var i = g[C];
    if (typeof i == "string") x += s(p(i));
    else {
      var R = s(p(i.prefix)), y = s(p(i.suffix));
      if (i.pattern)
        if (n && n.push(i), R || y)
          if (i.modifier === "+" || i.modifier === "*") {
            var O = i.modifier === "*" ? "?" : "";
            x += "(?:".concat(R, "((?:").concat(i.pattern, ")(?:").concat(y).concat(R, "(?:").concat(i.pattern, "))*)").concat(y, ")").concat(O);
          } else x += "(?:".concat(R, "(").concat(i.pattern, ")").concat(y, ")").concat(i.modifier);
        else {
          if (i.modifier === "+" || i.modifier === "*")
            throw new TypeError('Can not repeat "'.concat(i.name, '" without a prefix and suffix'));
          x += "(".concat(i.pattern, ")").concat(i.modifier);
        }
      else x += "(?:".concat(R).concat(y, ")").concat(i.modifier);
    }
  }
  if (m) u || (x += "".concat(T, "?")), x += e.endsWith ? "(?=".concat(A, ")") : "$";
  else {
    var b = r[r.length - 1], l = typeof b == "string" ? T.indexOf(b[b.length - 1]) > -1 : b === void 0;
    u || (x += "(?:".concat(T, "(?=").concat(A, "))?")), l || (x += "(?=".concat(T, "|").concat(A, ")"));
  }
  return new RegExp(x, D(e));
}
function P(r, n, e) {
  return r instanceof RegExp ? $(r, n) : Array.isArray(r) ? W(r, n, e) : L(r, n, e);
}
function match(str, options) {
  try {
    return H(str, options);
  } catch (e) {
    throw new Error(
      `Invalid path and options: Consult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp/tree/6.x
${e.message}`
    );
  }
}
var init_chunk_JJHTUJGL = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-JJHTUJGL.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    __name(_, "_");
    __name(F, "F");
    __name(H, "H");
    __name(I, "I");
    __name(s, "s");
    __name(D, "D");
    __name($, "$");
    __name(W, "W");
    __name(L, "L");
    __name(U, "U");
    __name(P, "P");
    __name(match, "match");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/pathToRegexp.mjs
var init_pathToRegexp = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/pathToRegexp.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_JJHTUJGL();
    init_chunk_7ELT755Q();
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-43A5F2IE.mjs
var init_chunk_43A5F2IE = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-43A5F2IE.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/authorization-errors.mjs
var init_authorization_errors = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/authorization-errors.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_43A5F2IE();
    init_chunk_7ELT755Q();
  }
});

// ../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-EI3YIHOJ.mjs
function mergePreDefinedOptions(preDefinedOptions, options) {
  return Object.keys(preDefinedOptions).reduce(
    (obj, key) => {
      return { ...obj, [key]: options[key] || obj[key] };
    },
    { ...preDefinedOptions }
  );
}
function assertValidSecretKey(val) {
  if (!val || typeof val !== "string") {
    throw Error("Missing Clerk Secret Key. Go to https://dashboard.clerk.com and get your key for your instance.");
  }
}
function assertValidPublishableKey(val) {
  parsePublishableKey(val, { fatal: true });
}
function joinPaths(...args) {
  return args.filter((p) => p).join(SEPARATOR).replace(MULTIPLE_SEPARATOR_REGEX, SEPARATOR);
}
function mapObject(object, mapper, options) {
  if (!isObject(object)) {
    throw new TypeError(`Expected an object, got \`${object}\` (${typeof object})`);
  }
  if (Array.isArray(object)) {
    throw new TypeError("Expected an object, got an array");
  }
  return _mapObject(object, mapper, options);
}
function split(value) {
  let result = value.trim();
  result = result.replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE).replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);
  result = result.replace(DEFAULT_STRIP_REGEXP, "\0");
  let start = 0;
  let end = result.length;
  while (result.charAt(start) === "\0")
    start++;
  if (start === end)
    return [];
  while (result.charAt(end - 1) === "\0")
    end--;
  return result.slice(start, end).split(/\0/g);
}
function splitSeparateNumbers(value) {
  const words = split(value);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const match22 = SPLIT_SEPARATE_NUMBER_RE.exec(word);
    if (match22) {
      const offset = match22.index + (match22[1] ?? match22[2]).length;
      words.splice(i, 1, word.slice(0, offset), word.slice(offset));
    }
  }
  return words;
}
function noCase(input, options) {
  const [prefix, words, suffix] = splitPrefixSuffix(input, options);
  return prefix + words.map(lowerFactory(options?.locale)).join(options?.delimiter ?? " ") + suffix;
}
function snakeCase(input, options) {
  return noCase(input, { delimiter: "_", ...options });
}
function lowerFactory(locale) {
  return locale === false ? (input) => input.toLowerCase() : (input) => input.toLocaleLowerCase(locale);
}
function splitPrefixSuffix(input, options = {}) {
  const splitFn = options.split ?? (options.separateNumbers ? splitSeparateNumbers : split);
  const prefixCharacters = options.prefixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  const suffixCharacters = options.suffixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  let prefixIndex = 0;
  let suffixIndex = input.length;
  while (prefixIndex < input.length) {
    const char = input.charAt(prefixIndex);
    if (!prefixCharacters.includes(char))
      break;
    prefixIndex++;
  }
  while (suffixIndex > prefixIndex) {
    const index = suffixIndex - 1;
    const char = input.charAt(index);
    if (!suffixCharacters.includes(char))
      break;
    suffixIndex = index;
  }
  return [
    input.slice(0, prefixIndex),
    splitFn(input.slice(prefixIndex, suffixIndex)),
    input.slice(suffixIndex)
  ];
}
function snakecaseKeys(obj, options) {
  if (Array.isArray(obj)) {
    if (obj.some((item) => item.constructor !== PlainObjectConstructor)) {
      throw new Error("obj must be array of plain objects");
    }
    options = { deep: true, exclude: [], parsingOptions: {}, ...options };
    const convertCase2 = options.snakeCase || ((key) => snakeCase(key, options.parsingOptions));
    return obj.map((item) => {
      return mapObject(item, (key, val) => {
        return [
          matches(options.exclude, key) ? key : convertCase2(key),
          val,
          mapperOptions(key, val, options)
        ];
      }, options);
    });
  } else {
    if (obj.constructor !== PlainObjectConstructor) {
      throw new Error("obj must be an plain object");
    }
  }
  options = { deep: true, exclude: [], parsingOptions: {}, ...options };
  const convertCase = options.snakeCase || ((key) => snakeCase(key, options.parsingOptions));
  return mapObject(obj, (key, val) => {
    return [
      matches(options.exclude, key) ? key : convertCase(key),
      val,
      mapperOptions(key, val, options)
    ];
  }, options);
}
function matches(patterns, value) {
  return patterns.some((pattern) => {
    return typeof pattern === "string" ? pattern === value : pattern.test(value);
  });
}
function mapperOptions(key, val, options) {
  return options.shouldRecurse ? { shouldRecurse: options.shouldRecurse(key, val) } : void 0;
}
function deserialize(payload) {
  let data, totalCount;
  if (Array.isArray(payload)) {
    const data2 = payload.map((item) => jsonToObject(item));
    return { data: data2 };
  } else if (isPaginated(payload)) {
    data = payload.data.map((item) => jsonToObject(item));
    totalCount = payload.total_count;
    return { data, totalCount };
  } else {
    return { data: jsonToObject(payload) };
  }
}
function isPaginated(payload) {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    return false;
  }
  return Array.isArray(payload.data) && payload.data !== void 0;
}
function getCount(item) {
  return item.total_count;
}
function jsonToObject(item) {
  if (typeof item !== "string" && "object" in item && "deleted" in item) {
    return DeletedObject.fromJSON(item);
  }
  switch (item.object) {
    case ObjectType.AccountlessApplication:
      return AccountlessApplication.fromJSON(item);
    case ObjectType.ActorToken:
      return ActorToken.fromJSON(item);
    case ObjectType.AllowlistIdentifier:
      return AllowlistIdentifier.fromJSON(item);
    case ObjectType.ApiKey:
      return APIKey.fromJSON(item);
    case ObjectType.BlocklistIdentifier:
      return BlocklistIdentifier.fromJSON(item);
    case ObjectType.Client:
      return Client.fromJSON(item);
    case ObjectType.Cookies:
      return Cookies2.fromJSON(item);
    case ObjectType.Domain:
      return Domain.fromJSON(item);
    case ObjectType.EmailAddress:
      return EmailAddress.fromJSON(item);
    case ObjectType.Email:
      return Email.fromJSON(item);
    case ObjectType.IdpOAuthAccessToken:
      return IdPOAuthAccessToken.fromJSON(item);
    case ObjectType.Instance:
      return Instance.fromJSON(item);
    case ObjectType.InstanceRestrictions:
      return InstanceRestrictions.fromJSON(item);
    case ObjectType.InstanceSettings:
      return InstanceSettings.fromJSON(item);
    case ObjectType.Invitation:
      return Invitation.fromJSON(item);
    case ObjectType.JwtTemplate:
      return JwtTemplate.fromJSON(item);
    case ObjectType.Machine:
      return Machine.fromJSON(item);
    case ObjectType.MachineScope:
      return MachineScope.fromJSON(item);
    case ObjectType.MachineSecretKey:
      return MachineSecretKey.fromJSON(item);
    case ObjectType.M2MToken:
      return M2MToken.fromJSON(item);
    case ObjectType.OauthAccessToken:
      return OauthAccessToken.fromJSON(item);
    case ObjectType.OAuthApplication:
      return OAuthApplication.fromJSON(item);
    case ObjectType.Organization:
      return Organization.fromJSON(item);
    case ObjectType.OrganizationInvitation:
      return OrganizationInvitation.fromJSON(item);
    case ObjectType.OrganizationMembership:
      return OrganizationMembership.fromJSON(item);
    case ObjectType.OrganizationSettings:
      return OrganizationSettings.fromJSON(item);
    case ObjectType.PhoneNumber:
      return PhoneNumber.fromJSON(item);
    case ObjectType.ProxyCheck:
      return ProxyCheck.fromJSON(item);
    case ObjectType.RedirectUrl:
      return RedirectUrl.fromJSON(item);
    case ObjectType.SamlConnection:
      return SamlConnection.fromJSON(item);
    case ObjectType.SignInToken:
      return SignInToken.fromJSON(item);
    case ObjectType.SignUpAttempt:
      return SignUpAttempt.fromJSON(item);
    case ObjectType.Session:
      return Session.fromJSON(item);
    case ObjectType.SmsMessage:
      return SMSMessage.fromJSON(item);
    case ObjectType.Token:
      return Token.fromJSON(item);
    case ObjectType.TotalCount:
      return getCount(item);
    case ObjectType.User:
      return User.fromJSON(item);
    case ObjectType.WaitlistEntry:
      return WaitlistEntry.fromJSON(item);
    case ObjectType.CommercePlan:
      return CommercePlan.fromJSON(item);
    case ObjectType.CommerceSubscription:
      return CommerceSubscription.fromJSON(item);
    case ObjectType.CommerceSubscriptionItem:
      return CommerceSubscriptionItem.fromJSON(item);
    case ObjectType.Feature:
      return Feature.fromJSON(item);
    default:
      return item;
  }
}
function buildRequest(options) {
  const requestFn = /* @__PURE__ */ __name(async (requestOptions) => {
    const {
      secretKey,
      machineSecretKey,
      useMachineSecretKey = false,
      requireSecretKey = true,
      apiUrl = API_URL,
      apiVersion = API_VERSION,
      userAgent = USER_AGENT,
      skipApiVersionInUrl = false
    } = options;
    const { path, method, queryParams, headerParams, bodyParams, formData, options: opts } = requestOptions;
    const { deepSnakecaseBodyParamKeys = false } = opts || {};
    if (requireSecretKey) {
      assertValidSecretKey(secretKey);
    }
    const url = skipApiVersionInUrl ? joinPaths(apiUrl, path) : joinPaths(apiUrl, apiVersion, path);
    const finalUrl = new URL(url);
    if (queryParams) {
      const snakecasedQueryParams = snakecase_keys_default({ ...queryParams });
      for (const [key, val] of Object.entries(snakecasedQueryParams)) {
        if (val) {
          [val].flat().forEach((v) => finalUrl.searchParams.append(key, v));
        }
      }
    }
    const headers = new Headers({
      "Clerk-API-Version": SUPPORTED_BAPI_VERSION,
      [constants.Headers.UserAgent]: userAgent,
      ...headerParams
    });
    const authorizationHeader = constants.Headers.Authorization;
    if (!headers.has(authorizationHeader)) {
      if (useMachineSecretKey && machineSecretKey) {
        headers.set(authorizationHeader, `Bearer ${machineSecretKey}`);
      } else if (secretKey) {
        headers.set(authorizationHeader, `Bearer ${secretKey}`);
      }
    }
    let res;
    try {
      if (formData) {
        res = await runtime.fetch(finalUrl.href, {
          method,
          headers,
          body: formData
        });
      } else {
        headers.set("Content-Type", "application/json");
        const buildBody = /* @__PURE__ */ __name(() => {
          const hasBody = method !== "GET" && bodyParams && Object.keys(bodyParams).length > 0;
          if (!hasBody) {
            return null;
          }
          const formatKeys = /* @__PURE__ */ __name((object) => snakecase_keys_default(object, { deep: deepSnakecaseBodyParamKeys }), "formatKeys");
          return {
            body: JSON.stringify(Array.isArray(bodyParams) ? bodyParams.map(formatKeys) : formatKeys(bodyParams))
          };
        }, "buildBody");
        res = await runtime.fetch(finalUrl.href, {
          method,
          headers,
          ...buildBody()
        });
      }
      const isJSONResponse = res?.headers && res.headers?.get(constants.Headers.ContentType) === constants.ContentTypes.Json;
      const responseBody = await (isJSONResponse ? res.json() : res.text());
      if (!res.ok) {
        return {
          data: null,
          errors: parseErrors2(responseBody),
          status: res?.status,
          statusText: res?.statusText,
          clerkTraceId: getTraceId(responseBody, res?.headers),
          retryAfter: getRetryAfter(res?.headers)
        };
      }
      return {
        ...deserialize(responseBody),
        errors: null
      };
    } catch (err) {
      if (err instanceof Error) {
        return {
          data: null,
          errors: [
            {
              code: "unexpected_error",
              message: err.message || "Unexpected error"
            }
          ],
          clerkTraceId: getTraceId(err, res?.headers)
        };
      }
      return {
        data: null,
        errors: parseErrors2(err),
        status: res?.status,
        statusText: res?.statusText,
        clerkTraceId: getTraceId(err, res?.headers),
        retryAfter: getRetryAfter(res?.headers)
      };
    }
  }, "requestFn");
  return withLegacyRequestReturn(requestFn);
}
function getTraceId(data, headers) {
  if (data && typeof data === "object" && "clerk_trace_id" in data && typeof data.clerk_trace_id === "string") {
    return data.clerk_trace_id;
  }
  const cfRay = headers?.get("cf-ray");
  return cfRay || "";
}
function getRetryAfter(headers) {
  const retryAfter = headers?.get("Retry-After");
  if (!retryAfter) {
    return;
  }
  const value = parseInt(retryAfter, 10);
  if (isNaN(value)) {
    return;
  }
  return value;
}
function parseErrors2(data) {
  if (!!data && typeof data === "object" && "errors" in data) {
    const errors = data.errors;
    return errors.length > 0 ? errors.map(parseError) : [];
  }
  return [];
}
function withLegacyRequestReturn(cb) {
  return async (...args) => {
    const { data, errors, totalCount, status, statusText, clerkTraceId, retryAfter } = await cb(...args);
    if (errors) {
      const error = new ClerkAPIResponseError(statusText || "", {
        data: [],
        status,
        clerkTraceId,
        retryAfter
      });
      error.errors = errors;
      throw error;
    }
    if (typeof totalCount !== "undefined") {
      return { data, totalCount };
    }
    return data;
  };
}
function createBackendApiClient(options) {
  const request = buildRequest(options);
  return {
    __experimental_accountlessApplications: new AccountlessApplicationAPI(
      buildRequest({ ...options, requireSecretKey: false })
    ),
    actorTokens: new ActorTokenAPI(request),
    allowlistIdentifiers: new AllowlistIdentifierAPI(request),
    apiKeys: new APIKeysAPI(
      buildRequest({
        ...options,
        skipApiVersionInUrl: true
      })
    ),
    betaFeatures: new BetaFeaturesAPI(request),
    blocklistIdentifiers: new BlocklistIdentifierAPI(request),
    /**
     * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
     * It is advised to pin the SDK version to avoid breaking changes.
     */
    billing: new BillingAPI(request),
    clients: new ClientAPI(request),
    domains: new DomainAPI(request),
    emailAddresses: new EmailAddressAPI(request),
    idPOAuthAccessToken: new IdPOAuthAccessTokenApi(
      buildRequest({
        ...options,
        skipApiVersionInUrl: true
      })
    ),
    instance: new InstanceAPI(request),
    invitations: new InvitationAPI(request),
    jwks: new JwksAPI(request),
    jwtTemplates: new JwtTemplatesApi(request),
    machines: new MachineApi(request),
    m2m: new M2MTokenApi(
      buildRequest({
        ...options,
        skipApiVersionInUrl: true,
        requireSecretKey: false,
        useMachineSecretKey: true
      })
    ),
    oauthApplications: new OAuthApplicationsApi(request),
    organizations: new OrganizationAPI(request),
    phoneNumbers: new PhoneNumberAPI(request),
    proxyChecks: new ProxyCheckAPI(request),
    redirectUrls: new RedirectUrlAPI(request),
    samlConnections: new SamlConnectionAPI(request),
    sessions: new SessionAPI(request),
    signInTokens: new SignInTokenAPI(request),
    signUps: new SignUpAPI(request),
    testingTokens: new TestingTokenAPI(request),
    users: new UserAPI(request),
    waitlistEntries: new WaitlistEntryAPI(request),
    webhooks: new WebhookAPI(request)
  };
}
function isMachineTokenByPrefix(token) {
  return MACHINE_TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix));
}
function getMachineTokenType(token) {
  if (token.startsWith(M2M_TOKEN_PREFIX)) {
    return TokenType.M2MToken;
  }
  if (token.startsWith(OAUTH_TOKEN_PREFIX)) {
    return TokenType.OAuthToken;
  }
  if (token.startsWith(API_KEY_PREFIX)) {
    return TokenType.ApiKey;
  }
  throw new Error("Unknown machine token type");
}
function signedInAuthObject(authenticateContext, sessionToken, sessionClaims) {
  const { actor, sessionId, sessionStatus, userId, orgId, orgRole, orgSlug, orgPermissions, factorVerificationAge } = __experimental_JWTPayloadToAuthObjectProperties(sessionClaims);
  const apiClient = createBackendApiClient(authenticateContext);
  const getToken = createGetToken({
    sessionId,
    sessionToken,
    fetcher: /* @__PURE__ */ __name(async (sessionId2, template, expiresInSeconds) => (await apiClient.sessions.getToken(sessionId2, template || "", expiresInSeconds)).jwt, "fetcher")
  });
  return {
    tokenType: TokenType.SessionToken,
    actor,
    sessionClaims,
    sessionId,
    sessionStatus,
    userId,
    orgId,
    orgRole,
    orgSlug,
    orgPermissions,
    factorVerificationAge,
    getToken,
    has: createCheckAuthorization({
      orgId,
      orgRole,
      orgPermissions,
      userId,
      factorVerificationAge,
      features: sessionClaims.fea || "",
      plans: sessionClaims.pla || ""
    }),
    debug: createDebug({ ...authenticateContext, sessionToken }),
    isAuthenticated: true
  };
}
function signedOutAuthObject(debugData, initialSessionStatus) {
  return {
    tokenType: TokenType.SessionToken,
    sessionClaims: null,
    sessionId: null,
    sessionStatus: initialSessionStatus ?? null,
    userId: null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    factorVerificationAge: null,
    getToken: /* @__PURE__ */ __name(() => Promise.resolve(null), "getToken"),
    has: /* @__PURE__ */ __name(() => false, "has"),
    debug: createDebug(debugData),
    isAuthenticated: false
  };
}
function authenticatedMachineObject(tokenType, token, verificationResult, debugData) {
  const baseObject = {
    id: verificationResult.id,
    subject: verificationResult.subject,
    getToken: /* @__PURE__ */ __name(() => Promise.resolve(token), "getToken"),
    has: /* @__PURE__ */ __name(() => false, "has"),
    debug: createDebug(debugData),
    isAuthenticated: true
  };
  switch (tokenType) {
    case TokenType.ApiKey: {
      const result = verificationResult;
      return {
        ...baseObject,
        tokenType,
        name: result.name,
        claims: result.claims,
        scopes: result.scopes,
        userId: result.subject.startsWith("user_") ? result.subject : null,
        orgId: result.subject.startsWith("org_") ? result.subject : null
      };
    }
    case TokenType.M2MToken: {
      const result = verificationResult;
      return {
        ...baseObject,
        tokenType,
        claims: result.claims,
        scopes: result.scopes,
        machineId: result.subject
      };
    }
    case TokenType.OAuthToken: {
      const result = verificationResult;
      return {
        ...baseObject,
        tokenType,
        scopes: result.scopes,
        userId: result.subject,
        clientId: result.clientId
      };
    }
    default:
      throw new Error(`Invalid token type: ${tokenType}`);
  }
}
function unauthenticatedMachineObject(tokenType, debugData) {
  const baseObject = {
    id: null,
    subject: null,
    scopes: null,
    has: /* @__PURE__ */ __name(() => false, "has"),
    getToken: /* @__PURE__ */ __name(() => Promise.resolve(null), "getToken"),
    debug: createDebug(debugData),
    isAuthenticated: false
  };
  switch (tokenType) {
    case TokenType.ApiKey: {
      return {
        ...baseObject,
        tokenType,
        name: null,
        claims: null,
        scopes: null,
        userId: null,
        orgId: null
      };
    }
    case TokenType.M2MToken: {
      return {
        ...baseObject,
        tokenType,
        claims: null,
        scopes: null,
        machineId: null
      };
    }
    case TokenType.OAuthToken: {
      return {
        ...baseObject,
        tokenType,
        scopes: null,
        userId: null,
        clientId: null
      };
    }
    default:
      throw new Error(`Invalid token type: ${tokenType}`);
  }
}
function invalidTokenAuthObject() {
  return {
    isAuthenticated: false,
    tokenType: null,
    getToken: /* @__PURE__ */ __name(() => Promise.resolve(null), "getToken"),
    has: /* @__PURE__ */ __name(() => false, "has"),
    debug: /* @__PURE__ */ __name(() => ({}), "debug")
  };
}
function signedIn(params) {
  const { authenticateContext, headers = new Headers(), token } = params;
  const toAuth = /* @__PURE__ */ __name(({ treatPendingAsSignedOut = true } = {}) => {
    if (params.tokenType === TokenType.SessionToken) {
      const { sessionClaims } = params;
      const authObject = signedInAuthObject(authenticateContext, token, sessionClaims);
      if (treatPendingAsSignedOut && authObject.sessionStatus === "pending") {
        return signedOutAuthObject(void 0, authObject.sessionStatus);
      }
      return authObject;
    }
    const { machineData } = params;
    return authenticatedMachineObject(params.tokenType, token, machineData, authenticateContext);
  }, "toAuth");
  return {
    status: AuthStatus.SignedIn,
    reason: null,
    message: null,
    proxyUrl: authenticateContext.proxyUrl || "",
    publishableKey: authenticateContext.publishableKey || "",
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || "",
    signInUrl: authenticateContext.signInUrl || "",
    signUpUrl: authenticateContext.signUpUrl || "",
    afterSignInUrl: authenticateContext.afterSignInUrl || "",
    afterSignUpUrl: authenticateContext.afterSignUpUrl || "",
    isSignedIn: true,
    isAuthenticated: true,
    tokenType: params.tokenType,
    toAuth,
    headers,
    token
  };
}
function signedOut(params) {
  const { authenticateContext, headers = new Headers(), reason, message = "", tokenType } = params;
  const toAuth = /* @__PURE__ */ __name(() => {
    if (tokenType === TokenType.SessionToken) {
      return signedOutAuthObject({ ...authenticateContext, status: AuthStatus.SignedOut, reason, message });
    }
    return unauthenticatedMachineObject(tokenType, { reason, message, headers });
  }, "toAuth");
  return withDebugHeaders({
    status: AuthStatus.SignedOut,
    reason,
    message,
    proxyUrl: authenticateContext.proxyUrl || "",
    publishableKey: authenticateContext.publishableKey || "",
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || "",
    signInUrl: authenticateContext.signInUrl || "",
    signUpUrl: authenticateContext.signUpUrl || "",
    afterSignInUrl: authenticateContext.afterSignInUrl || "",
    afterSignUpUrl: authenticateContext.afterSignUpUrl || "",
    isSignedIn: false,
    isAuthenticated: false,
    tokenType,
    toAuth,
    headers,
    token: null
  });
}
function handshake(authenticateContext, reason, message = "", headers) {
  return withDebugHeaders({
    status: AuthStatus.Handshake,
    reason,
    message,
    publishableKey: authenticateContext.publishableKey || "",
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || "",
    proxyUrl: authenticateContext.proxyUrl || "",
    signInUrl: authenticateContext.signInUrl || "",
    signUpUrl: authenticateContext.signUpUrl || "",
    afterSignInUrl: authenticateContext.afterSignInUrl || "",
    afterSignUpUrl: authenticateContext.afterSignUpUrl || "",
    isSignedIn: false,
    isAuthenticated: false,
    tokenType: TokenType.SessionToken,
    toAuth: /* @__PURE__ */ __name(() => null, "toAuth"),
    headers,
    token: null
  });
}
function signedOutInvalidToken() {
  const authObject = invalidTokenAuthObject();
  return withDebugHeaders({
    status: AuthStatus.SignedOut,
    reason: AuthErrorReason.TokenTypeMismatch,
    message: "",
    proxyUrl: "",
    publishableKey: "",
    isSatellite: false,
    domain: "",
    signInUrl: "",
    signUpUrl: "",
    afterSignInUrl: "",
    afterSignUpUrl: "",
    isSignedIn: false,
    isAuthenticated: false,
    tokenType: null,
    toAuth: /* @__PURE__ */ __name(() => authObject, "toAuth"),
    headers: new Headers(),
    token: null
  });
}
function getFromCache(kid) {
  return cache[kid];
}
function getCacheValues() {
  return Object.values(cache);
}
function setInCache(jwk, shouldExpire = true) {
  cache[jwk.kid] = jwk;
  lastUpdatedAt = shouldExpire ? Date.now() : -1;
}
function loadClerkJWKFromLocal(localKey) {
  if (!getFromCache(LocalJwkKid)) {
    if (!localKey) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.SetClerkJWTKey,
        message: "Missing local JWK.",
        reason: TokenVerificationErrorReason.LocalJWKMissing
      });
    }
    const modulus = localKey.replace(/\r\n|\n|\r/g, "").replace(PEM_HEADER, "").replace(PEM_TRAILER, "").replace(RSA_PREFIX, "").replace(RSA_SUFFIX, "").replace(/\+/g, "-").replace(/\//g, "_");
    setInCache(
      {
        kid: "local",
        kty: "RSA",
        alg: "RS256",
        n: modulus,
        e: "AQAB"
      },
      false
      // local key never expires in cache
    );
  }
  return getFromCache(LocalJwkKid);
}
async function loadClerkJWKFromRemote({
  secretKey,
  apiUrl = API_URL,
  apiVersion = API_VERSION,
  kid,
  skipJwksCache
}) {
  if (skipJwksCache || cacheHasExpired() || !getFromCache(kid)) {
    if (!secretKey) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: "Failed to load JWKS from Clerk Backend or Frontend API.",
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
      });
    }
    const fetcher = /* @__PURE__ */ __name(() => fetchJWKSFromBAPI(apiUrl, secretKey, apiVersion), "fetcher");
    const { keys } = await retry(fetcher);
    if (!keys || !keys.length) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: "The JWKS endpoint did not contain any signing keys. Contact support@clerk.com.",
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
      });
    }
    keys.forEach((key) => setInCache(key));
  }
  const jwk = getFromCache(kid);
  if (!jwk) {
    const cacheValues = getCacheValues();
    const jwkKeys = cacheValues.map((jwk2) => jwk2.kid).sort().join(", ");
    throw new TokenVerificationError({
      action: `Go to your Dashboard and validate your secret and public keys are correct. ${TokenVerificationErrorAction.ContactSupport} if the issue persists.`,
      message: `Unable to find a signing key in JWKS that matches the kid='${kid}' of the provided session token. Please make sure that the __session cookie or the HTTP authorization header contain a Clerk-generated session JWT. The following kid is available: ${jwkKeys}`,
      reason: TokenVerificationErrorReason.JWKKidMismatch
    });
  }
  return jwk;
}
async function fetchJWKSFromBAPI(apiUrl, key, apiVersion) {
  if (!key) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkSecretKey,
      message: "Missing Clerk Secret Key or API Key. Go to https://dashboard.clerk.com and get your key for your instance.",
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
    });
  }
  const url = new URL(apiUrl);
  url.pathname = joinPaths(url.pathname, apiVersion, "/jwks");
  const response = await runtime.fetch(url.href, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Clerk-API-Version": SUPPORTED_BAPI_VERSION,
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT
    }
  });
  if (!response.ok) {
    const json = await response.json();
    const invalidSecretKeyError = getErrorObjectByCode(json?.errors, TokenVerificationErrorCode.InvalidSecretKey);
    if (invalidSecretKeyError) {
      const reason = TokenVerificationErrorReason.InvalidSecretKey;
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: invalidSecretKeyError.message,
        reason
      });
    }
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.ContactSupport,
      message: `Error loading Clerk JWKS from ${url.href} with code=${response.status}`,
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
    });
  }
  return response.json();
}
function cacheHasExpired() {
  if (lastUpdatedAt === -1) {
    return false;
  }
  const isExpired = Date.now() - lastUpdatedAt >= MAX_CACHE_LAST_UPDATED_AT_SECONDS * 1e3;
  if (isExpired) {
    cache = {};
  }
  return isExpired;
}
async function verifyToken(token, options) {
  const { data: decodedResult, errors } = decodeJwt(token);
  if (errors) {
    return { errors };
  }
  const { header } = decodedResult;
  const { kid } = header;
  try {
    let key;
    if (options.jwtKey) {
      key = loadClerkJWKFromLocal(options.jwtKey);
    } else if (options.secretKey) {
      key = await loadClerkJWKFromRemote({ ...options, kid });
    } else {
      return {
        errors: [
          new TokenVerificationError({
            action: TokenVerificationErrorAction.SetClerkJWTKey,
            message: "Failed to resolve JWK during verification.",
            reason: TokenVerificationErrorReason.JWKFailedToResolve
          })
        ]
      };
    }
    return await verifyJwt(token, { ...options, key });
  } catch (error) {
    return { errors: [error] };
  }
}
function handleClerkAPIError(tokenType, err, notFoundMessage) {
  if (isClerkAPIResponseError(err)) {
    let code;
    let message;
    switch (err.status) {
      case 401:
        code = MachineTokenVerificationErrorCode.InvalidSecretKey;
        message = err.errors[0]?.message || "Invalid secret key";
        break;
      case 404:
        code = MachineTokenVerificationErrorCode.TokenInvalid;
        message = notFoundMessage;
        break;
      default:
        code = MachineTokenVerificationErrorCode.UnexpectedError;
        message = "Unexpected error";
    }
    return {
      data: void 0,
      tokenType,
      errors: [
        new MachineTokenVerificationError({
          message,
          code,
          status: err.status
        })
      ]
    };
  }
  return {
    data: void 0,
    tokenType,
    errors: [
      new MachineTokenVerificationError({
        message: "Unexpected error",
        code: MachineTokenVerificationErrorCode.UnexpectedError,
        status: err.status
      })
    ]
  };
}
async function verifyM2MToken(token, options) {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.m2m.verifyToken({ token });
    return { data: verifiedToken, tokenType: TokenType.M2MToken, errors: void 0 };
  } catch (err) {
    return handleClerkAPIError(TokenType.M2MToken, err, "Machine token not found");
  }
}
async function verifyOAuthToken(accessToken, options) {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.idPOAuthAccessToken.verifyAccessToken(accessToken);
    return { data: verifiedToken, tokenType: TokenType.OAuthToken, errors: void 0 };
  } catch (err) {
    return handleClerkAPIError(TokenType.OAuthToken, err, "OAuth token not found");
  }
}
async function verifyAPIKey(secret, options) {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.apiKeys.verifySecret(secret);
    return { data: verifiedToken, tokenType: TokenType.ApiKey, errors: void 0 };
  } catch (err) {
    return handleClerkAPIError(TokenType.ApiKey, err, "API key not found");
  }
}
async function verifyMachineAuthToken(token, options) {
  if (token.startsWith(M2M_TOKEN_PREFIX)) {
    return verifyM2MToken(token, options);
  }
  if (token.startsWith(OAUTH_TOKEN_PREFIX)) {
    return verifyOAuthToken(token, options);
  }
  if (token.startsWith(API_KEY_PREFIX)) {
    return verifyAPIKey(token, options);
  }
  throw new Error("Unknown machine token type");
}
async function verifyHandshakeJwt(token, { key }) {
  const { data: decoded, errors } = decodeJwt(token);
  if (errors) {
    throw errors[0];
  }
  const { header, payload } = decoded;
  const { typ, alg } = header;
  assertHeaderType(typ);
  assertHeaderAlgorithm(alg);
  const { data: signatureValid, errors: signatureErrors } = await hasValidSignature(decoded, key);
  if (signatureErrors) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Error verifying handshake token. ${signatureErrors[0]}`
    });
  }
  if (!signatureValid) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidSignature,
      message: "Handshake signature is invalid."
    });
  }
  return payload;
}
async function verifyHandshakeToken(token, options) {
  const { secretKey, apiUrl, apiVersion, jwksCacheTtlInMs, jwtKey, skipJwksCache } = options;
  const { data, errors } = decodeJwt(token);
  if (errors) {
    throw errors[0];
  }
  const { kid } = data.header;
  let key;
  if (jwtKey) {
    key = loadClerkJWKFromLocal(jwtKey);
  } else if (secretKey) {
    key = await loadClerkJWKFromRemote({ secretKey, apiUrl, apiVersion, kid, jwksCacheTtlInMs, skipJwksCache });
  } else {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkJWTKey,
      message: "Failed to resolve JWK during handshake verification.",
      reason: TokenVerificationErrorReason.JWKFailedToResolve
    });
  }
  return await verifyHandshakeJwt(token, {
    key
  });
}
function assertSignInUrlExists(signInUrl, key) {
  if (!signInUrl && isDevelopmentFromSecretKey(key)) {
    throw new Error(`Missing signInUrl. Pass a signInUrl for dev instances if an app is satellite`);
  }
}
function assertProxyUrlOrDomain(proxyUrlOrDomain) {
  if (!proxyUrlOrDomain) {
    throw new Error(`Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl`);
  }
}
function assertSignInUrlFormatAndOrigin(_signInUrl, origin) {
  let signInUrl;
  try {
    signInUrl = new URL(_signInUrl);
  } catch {
    throw new Error(`The signInUrl needs to have a absolute url format.`);
  }
  if (signInUrl.origin === origin) {
    throw new Error(`The signInUrl needs to be on a different origin than your satellite application.`);
  }
}
function assertMachineSecretOrSecretKey(authenticateContext) {
  if (!authenticateContext.machineSecretKey && !authenticateContext.secretKey) {
    throw new Error(
      "Machine token authentication requires either a Machine secret key or a Clerk secret key. Ensure a Clerk secret key or Machine secret key is set."
    );
  }
}
function isRequestEligibleForRefresh(err, authenticateContext, request) {
  return err.reason === TokenVerificationErrorReason.TokenExpired && !!authenticateContext.refreshTokenInCookie && request.method === "GET";
}
function checkTokenTypeMismatch(parsedTokenType, acceptsToken, authenticateContext) {
  const mismatch = !isTokenTypeAccepted(parsedTokenType, acceptsToken);
  if (mismatch) {
    const tokenTypeToReturn = typeof acceptsToken === "string" ? acceptsToken : parsedTokenType;
    return signedOut({
      tokenType: tokenTypeToReturn,
      authenticateContext,
      reason: AuthErrorReason.TokenTypeMismatch
    });
  }
  return null;
}
function isTokenTypeInAcceptedArray(acceptsToken, authenticateContext) {
  let parsedTokenType = null;
  const { tokenInHeader } = authenticateContext;
  if (tokenInHeader) {
    if (isMachineTokenByPrefix(tokenInHeader)) {
      parsedTokenType = getMachineTokenType(tokenInHeader);
    } else {
      parsedTokenType = TokenType.SessionToken;
    }
  }
  const typeToCheck = parsedTokenType ?? TokenType.SessionToken;
  return isTokenTypeAccepted(typeToCheck, acceptsToken);
}
function createAuthenticateRequest(params) {
  const buildTimeOptions = mergePreDefinedOptions(defaultOptions2, params.options);
  const apiClient = params.apiClient;
  const authenticateRequest2 = /* @__PURE__ */ __name((request, options = {}) => {
    const { apiUrl, apiVersion } = buildTimeOptions;
    const runTimeOptions = mergePreDefinedOptions(buildTimeOptions, options);
    return authenticateRequest(request, {
      ...options,
      ...runTimeOptions,
      // We should add all the omitted props from options here (eg apiUrl / apiVersion)
      // to avoid runtime options override them.
      apiUrl,
      apiVersion,
      apiClient
    });
  }, "authenticateRequest2");
  return {
    authenticateRequest: authenticateRequest2,
    debugRequestState
  };
}
var import_cookie, API_URL, API_VERSION, USER_AGENT, MAX_CACHE_LAST_UPDATED_AT_SECONDS, SUPPORTED_BAPI_VERSION, Attributes, Cookies, QueryParameters, Headers2, ContentTypes, constants, TokenType, AuthenticateContext, createAuthenticateContext, SEPARATOR, MULTIPLE_SEPARATOR_REGEX, AbstractAPI, basePath, ActorTokenAPI, basePath2, AccountlessApplicationAPI, basePath3, AllowlistIdentifierAPI, basePath4, APIKeysAPI, basePath5, BetaFeaturesAPI, basePath6, BlocklistIdentifierAPI, basePath7, ClientAPI, basePath8, DomainAPI, basePath9, EmailAddressAPI, basePath10, IdPOAuthAccessTokenApi, basePath11, InstanceAPI, basePath12, InvitationAPI, basePath13, MachineApi, basePath14, _M2MTokenApi_instances, createRequestOptions_fn, M2MTokenApi, basePath15, JwksAPI, basePath16, JwtTemplatesApi, basePath17, OrganizationAPI, basePath18, OAuthApplicationsApi, basePath19, PhoneNumberAPI, basePath20, ProxyCheckAPI, basePath21, RedirectUrlAPI, basePath22, SamlConnectionAPI, basePath23, SessionAPI, basePath24, SignInTokenAPI, basePath25, SignUpAPI, basePath26, TestingTokenAPI, basePath27, UserAPI, basePath28, WaitlistEntryAPI, basePath29, WebhookAPI, basePath30, organizationBasePath, userBasePath, BillingAPI, isObject, isObjectCustom, mapObjectSkip, _mapObject, SPLIT_LOWER_UPPER_RE, SPLIT_UPPER_UPPER_RE, SPLIT_SEPARATE_NUMBER_RE, DEFAULT_STRIP_REGEXP, SPLIT_REPLACE_VALUE, DEFAULT_PREFIX_SUFFIX_CHARACTERS, PlainObjectConstructor, snakecase_keys_default, AccountlessApplication, ActorToken, AllowlistIdentifier, APIKey, BlocklistIdentifier, SessionActivity, Session, Client, CnameTarget, Cookies2, DeletedObject, Domain, Email, IdentificationLink, Verification, EmailAddress, ExternalAccount, IdPOAuthAccessToken, Instance, InstanceRestrictions, InstanceSettings, Invitation, ObjectType, Machine, MachineScope, MachineSecretKey, M2MToken, JwtTemplate, OauthAccessToken, OAuthApplication, Organization, OrganizationInvitation, OrganizationMembership, OrganizationMembershipPublicUserData, OrganizationSettings, PhoneNumber, ProxyCheck, RedirectUrl, SamlConnection, SamlAccountConnection, AttributeMapping, SamlAccount, SignInToken, SignUpAttemptVerification, SignUpAttemptVerifications, SignUpAttempt, SMSMessage, Token, Web3Wallet, User, WaitlistEntry, Feature, CommercePlan, CommerceSubscriptionItem, CommerceSubscription, M2M_TOKEN_PREFIX, OAUTH_TOKEN_PREFIX, API_KEY_PREFIX, MACHINE_TOKEN_PREFIXES, isTokenTypeAccepted, createDebug, createGetToken, AuthStatus, AuthErrorReason, withDebugHeaders, ClerkUrl, createClerkUrl, ClerkRequest, createClerkRequest, getCookieName, getCookieValue, cache, lastUpdatedAt, LocalJwkKid, PEM_HEADER, PEM_TRAILER, RSA_PREFIX, RSA_SUFFIX, getErrorObjectByCode, HandshakeService, OrganizationMatcher, RefreshTokenErrorReason, authenticateRequest, debugRequestState, convertTokenVerificationErrorReasonToAuthErrorReason, defaultOptions2;
var init_chunk_EI3YIHOJ = __esm({
  "../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-EI3YIHOJ.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_LWOXHF4E();
    init_chunk_XJ4RTXJG();
    init_chunk_YW6OOOXM();
    init_chunk_RPS7XK5K();
    init_buildAccountsBaseUrl();
    init_buildAccountsBaseUrl();
    init_url();
    init_authorization();
    init_jwtPayloadParser();
    init_error();
    import_cookie = __toESM(require_dist(), 1);
    init_error();
    init_pathToRegexp();
    init_authorization_errors();
    API_URL = "https://api.clerk.com";
    API_VERSION = "v1";
    USER_AGENT = `${"@clerk/backend"}@${"2.14.0"}`;
    MAX_CACHE_LAST_UPDATED_AT_SECONDS = 5 * 60;
    SUPPORTED_BAPI_VERSION = "2025-04-10";
    Attributes = {
      AuthToken: "__clerkAuthToken",
      AuthSignature: "__clerkAuthSignature",
      AuthStatus: "__clerkAuthStatus",
      AuthReason: "__clerkAuthReason",
      AuthMessage: "__clerkAuthMessage",
      ClerkUrl: "__clerkUrl"
    };
    Cookies = {
      Session: "__session",
      Refresh: "__refresh",
      ClientUat: "__client_uat",
      Handshake: "__clerk_handshake",
      DevBrowser: "__clerk_db_jwt",
      RedirectCount: "__clerk_redirect_count",
      HandshakeNonce: "__clerk_handshake_nonce"
    };
    QueryParameters = {
      ClerkSynced: "__clerk_synced",
      SuffixedCookies: "suffixed_cookies",
      ClerkRedirectUrl: "__clerk_redirect_url",
      // use the reference to Cookies to indicate that it's the same value
      DevBrowser: Cookies.DevBrowser,
      Handshake: Cookies.Handshake,
      HandshakeHelp: "__clerk_help",
      LegacyDevBrowser: "__dev_session",
      HandshakeReason: "__clerk_hs_reason",
      HandshakeNonce: Cookies.HandshakeNonce,
      HandshakeFormat: "format"
    };
    Headers2 = {
      Accept: "accept",
      AuthMessage: "x-clerk-auth-message",
      Authorization: "authorization",
      AuthReason: "x-clerk-auth-reason",
      AuthSignature: "x-clerk-auth-signature",
      AuthStatus: "x-clerk-auth-status",
      AuthToken: "x-clerk-auth-token",
      CacheControl: "cache-control",
      ClerkRedirectTo: "x-clerk-redirect-to",
      ClerkRequestData: "x-clerk-request-data",
      ClerkUrl: "x-clerk-clerk-url",
      CloudFrontForwardedProto: "cloudfront-forwarded-proto",
      ContentType: "content-type",
      ContentSecurityPolicy: "content-security-policy",
      ContentSecurityPolicyReportOnly: "content-security-policy-report-only",
      EnableDebug: "x-clerk-debug",
      ForwardedHost: "x-forwarded-host",
      ForwardedPort: "x-forwarded-port",
      ForwardedProto: "x-forwarded-proto",
      Host: "host",
      Location: "location",
      Nonce: "x-nonce",
      Origin: "origin",
      Referrer: "referer",
      SecFetchDest: "sec-fetch-dest",
      SecFetchSite: "sec-fetch-site",
      UserAgent: "user-agent",
      ReportingEndpoints: "reporting-endpoints"
    };
    ContentTypes = {
      Json: "application/json"
    };
    constants = {
      Attributes,
      Cookies,
      Headers: Headers2,
      ContentTypes,
      QueryParameters
    };
    __name(mergePreDefinedOptions, "mergePreDefinedOptions");
    __name(assertValidSecretKey, "assertValidSecretKey");
    __name(assertValidPublishableKey, "assertValidPublishableKey");
    TokenType = {
      SessionToken: "session_token",
      ApiKey: "api_key",
      M2MToken: "m2m_token",
      OAuthToken: "oauth_token"
    };
    AuthenticateContext = class {
      static {
        __name(this, "AuthenticateContext");
      }
      constructor(cookieSuffix, clerkRequest, options) {
        this.cookieSuffix = cookieSuffix;
        this.clerkRequest = clerkRequest;
        this.originalFrontendApi = "";
        if (options.acceptsToken === TokenType.M2MToken || options.acceptsToken === TokenType.ApiKey) {
          this.initHeaderValues();
        } else {
          this.initPublishableKeyValues(options);
          this.initHeaderValues();
          this.initCookieValues();
          this.initHandshakeValues();
        }
        Object.assign(this, options);
        this.clerkUrl = this.clerkRequest.clerkUrl;
      }
      /**
       * Retrieves the session token from either the cookie or the header.
       *
       * @returns {string | undefined} The session token if available, otherwise undefined.
       */
      get sessionToken() {
        return this.sessionTokenInCookie || this.tokenInHeader;
      }
      usesSuffixedCookies() {
        const suffixedClientUat = this.getSuffixedCookie(constants.Cookies.ClientUat);
        const clientUat = this.getCookie(constants.Cookies.ClientUat);
        const suffixedSession = this.getSuffixedCookie(constants.Cookies.Session) || "";
        const session = this.getCookie(constants.Cookies.Session) || "";
        if (session && !this.tokenHasIssuer(session)) {
          return false;
        }
        if (session && !this.tokenBelongsToInstance(session)) {
          return true;
        }
        if (!suffixedClientUat && !suffixedSession) {
          return false;
        }
        const { data: sessionData } = decodeJwt(session);
        const sessionIat = sessionData?.payload.iat || 0;
        const { data: suffixedSessionData } = decodeJwt(suffixedSession);
        const suffixedSessionIat = suffixedSessionData?.payload.iat || 0;
        if (suffixedClientUat !== "0" && clientUat !== "0" && sessionIat > suffixedSessionIat) {
          return false;
        }
        if (suffixedClientUat === "0" && clientUat !== "0") {
          return false;
        }
        if (this.instanceType !== "production") {
          const isSuffixedSessionExpired = this.sessionExpired(suffixedSessionData);
          if (suffixedClientUat !== "0" && clientUat === "0" && isSuffixedSessionExpired) {
            return false;
          }
        }
        if (!suffixedClientUat && suffixedSession) {
          return false;
        }
        return true;
      }
      /**
       * Determines if the request came from a different origin based on the referrer header.
       * Used for cross-origin detection in multi-domain authentication flows.
       *
       * @returns {boolean} True if referrer exists and is from a different origin, false otherwise.
       */
      isCrossOriginReferrer() {
        if (!this.referrer || !this.clerkUrl.origin) {
          return false;
        }
        try {
          const referrerOrigin = new URL(this.referrer).origin;
          return referrerOrigin !== this.clerkUrl.origin;
        } catch {
          return false;
        }
      }
      /**
       * Determines if the referrer URL is from a Clerk domain (accounts portal or FAPI).
       * This includes both development and production account portal domains, as well as FAPI domains
       * used for redirect-based authentication flows.
       *
       * @returns {boolean} True if the referrer is from a Clerk accounts portal or FAPI domain, false otherwise
       */
      isKnownClerkReferrer() {
        if (!this.referrer) {
          return false;
        }
        try {
          const referrerOrigin = new URL(this.referrer);
          const referrerHost = referrerOrigin.hostname;
          if (this.frontendApi) {
            const fapiHost = this.frontendApi.startsWith("http") ? new URL(this.frontendApi).hostname : this.frontendApi;
            if (referrerHost === fapiHost) {
              return true;
            }
          }
          if (isLegacyDevAccountPortalOrigin(referrerHost) || isCurrentDevAccountPortalOrigin(referrerHost)) {
            return true;
          }
          const expectedAccountsUrl = buildAccountsBaseUrl(this.frontendApi);
          if (expectedAccountsUrl) {
            const expectedAccountsOrigin = new URL(expectedAccountsUrl).origin;
            if (referrerOrigin.origin === expectedAccountsOrigin) {
              return true;
            }
          }
          if (referrerHost.startsWith("accounts.")) {
            return true;
          }
          return false;
        } catch {
          return false;
        }
      }
      initPublishableKeyValues(options) {
        assertValidPublishableKey(options.publishableKey);
        this.publishableKey = options.publishableKey;
        const originalPk = parsePublishableKey(this.publishableKey, {
          fatal: true,
          domain: options.domain,
          isSatellite: options.isSatellite
        });
        this.originalFrontendApi = originalPk.frontendApi;
        const pk = parsePublishableKey(this.publishableKey, {
          fatal: true,
          proxyUrl: options.proxyUrl,
          domain: options.domain,
          isSatellite: options.isSatellite
        });
        this.instanceType = pk.instanceType;
        this.frontendApi = pk.frontendApi;
      }
      initHeaderValues() {
        this.tokenInHeader = this.parseAuthorizationHeader(this.getHeader(constants.Headers.Authorization));
        this.origin = this.getHeader(constants.Headers.Origin);
        this.host = this.getHeader(constants.Headers.Host);
        this.forwardedHost = this.getHeader(constants.Headers.ForwardedHost);
        this.forwardedProto = this.getHeader(constants.Headers.CloudFrontForwardedProto) || this.getHeader(constants.Headers.ForwardedProto);
        this.referrer = this.getHeader(constants.Headers.Referrer);
        this.userAgent = this.getHeader(constants.Headers.UserAgent);
        this.secFetchDest = this.getHeader(constants.Headers.SecFetchDest);
        this.accept = this.getHeader(constants.Headers.Accept);
      }
      initCookieValues() {
        this.sessionTokenInCookie = this.getSuffixedOrUnSuffixedCookie(constants.Cookies.Session);
        this.refreshTokenInCookie = this.getSuffixedCookie(constants.Cookies.Refresh);
        this.clientUat = Number.parseInt(this.getSuffixedOrUnSuffixedCookie(constants.Cookies.ClientUat) || "") || 0;
      }
      initHandshakeValues() {
        this.devBrowserToken = this.getQueryParam(constants.QueryParameters.DevBrowser) || this.getSuffixedOrUnSuffixedCookie(constants.Cookies.DevBrowser);
        this.handshakeToken = this.getQueryParam(constants.QueryParameters.Handshake) || this.getCookie(constants.Cookies.Handshake);
        this.handshakeRedirectLoopCounter = Number(this.getCookie(constants.Cookies.RedirectCount)) || 0;
        this.handshakeNonce = this.getQueryParam(constants.QueryParameters.HandshakeNonce) || this.getCookie(constants.Cookies.HandshakeNonce);
      }
      getQueryParam(name) {
        return this.clerkRequest.clerkUrl.searchParams.get(name);
      }
      getHeader(name) {
        return this.clerkRequest.headers.get(name) || void 0;
      }
      getCookie(name) {
        return this.clerkRequest.cookies.get(name) || void 0;
      }
      getSuffixedCookie(name) {
        return this.getCookie(getSuffixedCookieName(name, this.cookieSuffix)) || void 0;
      }
      getSuffixedOrUnSuffixedCookie(cookieName) {
        if (this.usesSuffixedCookies()) {
          return this.getSuffixedCookie(cookieName);
        }
        return this.getCookie(cookieName);
      }
      parseAuthorizationHeader(authorizationHeader) {
        if (!authorizationHeader) {
          return void 0;
        }
        const [scheme, token] = authorizationHeader.split(" ", 2);
        if (!token) {
          return scheme;
        }
        if (scheme === "Bearer") {
          return token;
        }
        return void 0;
      }
      tokenHasIssuer(token) {
        const { data, errors } = decodeJwt(token);
        if (errors) {
          return false;
        }
        return !!data.payload.iss;
      }
      tokenBelongsToInstance(token) {
        if (!token) {
          return false;
        }
        const { data, errors } = decodeJwt(token);
        if (errors) {
          return false;
        }
        const tokenIssuer = data.payload.iss.replace(/https?:\/\//gi, "");
        return this.originalFrontendApi === tokenIssuer;
      }
      sessionExpired(jwt) {
        return !!jwt && jwt?.payload.exp <= Date.now() / 1e3 >> 0;
      }
    };
    createAuthenticateContext = /* @__PURE__ */ __name(async (clerkRequest, options) => {
      const cookieSuffix = options.publishableKey ? await getCookieSuffix(options.publishableKey, runtime.crypto.subtle) : "";
      return new AuthenticateContext(cookieSuffix, clerkRequest, options);
    }, "createAuthenticateContext");
    SEPARATOR = "/";
    MULTIPLE_SEPARATOR_REGEX = new RegExp("(?<!:)" + SEPARATOR + "{1,}", "g");
    __name(joinPaths, "joinPaths");
    AbstractAPI = class {
      static {
        __name(this, "AbstractAPI");
      }
      constructor(request) {
        this.request = request;
      }
      requireId(id) {
        if (!id) {
          throw new Error("A valid resource ID is required.");
        }
      }
    };
    basePath = "/actor_tokens";
    ActorTokenAPI = class extends AbstractAPI {
      static {
        __name(this, "ActorTokenAPI");
      }
      async create(params) {
        return this.request({
          method: "POST",
          path: basePath,
          bodyParams: params
        });
      }
      async revoke(actorTokenId) {
        this.requireId(actorTokenId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath, actorTokenId, "revoke")
        });
      }
    };
    basePath2 = "/accountless_applications";
    AccountlessApplicationAPI = class extends AbstractAPI {
      static {
        __name(this, "AccountlessApplicationAPI");
      }
      async createAccountlessApplication(params) {
        const headerParams = params?.requestHeaders ? Object.fromEntries(params.requestHeaders.entries()) : void 0;
        return this.request({
          method: "POST",
          path: basePath2,
          headerParams
        });
      }
      async completeAccountlessApplicationOnboarding(params) {
        const headerParams = params?.requestHeaders ? Object.fromEntries(params.requestHeaders.entries()) : void 0;
        return this.request({
          method: "POST",
          path: joinPaths(basePath2, "complete"),
          headerParams
        });
      }
    };
    basePath3 = "/allowlist_identifiers";
    AllowlistIdentifierAPI = class extends AbstractAPI {
      static {
        __name(this, "AllowlistIdentifierAPI");
      }
      async getAllowlistIdentifierList(params = {}) {
        return this.request({
          method: "GET",
          path: basePath3,
          queryParams: { ...params, paginated: true }
        });
      }
      async createAllowlistIdentifier(params) {
        return this.request({
          method: "POST",
          path: basePath3,
          bodyParams: params
        });
      }
      async deleteAllowlistIdentifier(allowlistIdentifierId) {
        this.requireId(allowlistIdentifierId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath3, allowlistIdentifierId)
        });
      }
    };
    basePath4 = "/api_keys";
    APIKeysAPI = class extends AbstractAPI {
      static {
        __name(this, "APIKeysAPI");
      }
      async create(params) {
        return this.request({
          method: "POST",
          path: basePath4,
          bodyParams: params
        });
      }
      async revoke(params) {
        const { apiKeyId, ...bodyParams } = params;
        this.requireId(apiKeyId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath4, apiKeyId, "revoke"),
          bodyParams
        });
      }
      async getSecret(apiKeyId) {
        this.requireId(apiKeyId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath4, apiKeyId, "secret")
        });
      }
      async verifySecret(secret) {
        return this.request({
          method: "POST",
          path: joinPaths(basePath4, "verify"),
          bodyParams: { secret }
        });
      }
    };
    basePath5 = "/beta_features";
    BetaFeaturesAPI = class extends AbstractAPI {
      static {
        __name(this, "BetaFeaturesAPI");
      }
      /**
       * Change the domain of a production instance.
       *
       * Changing the domain requires updating the DNS records accordingly, deploying new SSL certificates,
       * updating your Social Connection's redirect URLs and setting the new keys in your code.
       *
       * @remarks
       * WARNING: Changing your domain will invalidate all current user sessions (i.e. users will be logged out).
       *          Also, while your application is being deployed, a small downtime is expected to occur.
       */
      async changeDomain(params) {
        return this.request({
          method: "POST",
          path: joinPaths(basePath5, "change_domain"),
          bodyParams: params
        });
      }
    };
    basePath6 = "/blocklist_identifiers";
    BlocklistIdentifierAPI = class extends AbstractAPI {
      static {
        __name(this, "BlocklistIdentifierAPI");
      }
      async getBlocklistIdentifierList(params = {}) {
        return this.request({
          method: "GET",
          path: basePath6,
          queryParams: params
        });
      }
      async createBlocklistIdentifier(params) {
        return this.request({
          method: "POST",
          path: basePath6,
          bodyParams: params
        });
      }
      async deleteBlocklistIdentifier(blocklistIdentifierId) {
        this.requireId(blocklistIdentifierId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath6, blocklistIdentifierId)
        });
      }
    };
    basePath7 = "/clients";
    ClientAPI = class extends AbstractAPI {
      static {
        __name(this, "ClientAPI");
      }
      async getClientList(params = {}) {
        return this.request({
          method: "GET",
          path: basePath7,
          queryParams: { ...params, paginated: true }
        });
      }
      async getClient(clientId) {
        this.requireId(clientId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath7, clientId)
        });
      }
      verifyClient(token) {
        return this.request({
          method: "POST",
          path: joinPaths(basePath7, "verify"),
          bodyParams: { token }
        });
      }
      async getHandshakePayload(queryParams) {
        return this.request({
          method: "GET",
          path: joinPaths(basePath7, "handshake_payload"),
          queryParams
        });
      }
    };
    basePath8 = "/domains";
    DomainAPI = class extends AbstractAPI {
      static {
        __name(this, "DomainAPI");
      }
      async list() {
        return this.request({
          method: "GET",
          path: basePath8
        });
      }
      async add(params) {
        return this.request({
          method: "POST",
          path: basePath8,
          bodyParams: params
        });
      }
      async update(params) {
        const { domainId, ...bodyParams } = params;
        this.requireId(domainId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath8, domainId),
          bodyParams
        });
      }
      /**
       * Deletes a satellite domain for the instance.
       * It is currently not possible to delete the instance's primary domain.
       */
      async delete(satelliteDomainId) {
        return this.deleteDomain(satelliteDomainId);
      }
      /**
       * @deprecated Use `delete` instead
       */
      async deleteDomain(satelliteDomainId) {
        this.requireId(satelliteDomainId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath8, satelliteDomainId)
        });
      }
    };
    basePath9 = "/email_addresses";
    EmailAddressAPI = class extends AbstractAPI {
      static {
        __name(this, "EmailAddressAPI");
      }
      async getEmailAddress(emailAddressId) {
        this.requireId(emailAddressId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath9, emailAddressId)
        });
      }
      async createEmailAddress(params) {
        return this.request({
          method: "POST",
          path: basePath9,
          bodyParams: params
        });
      }
      async updateEmailAddress(emailAddressId, params = {}) {
        this.requireId(emailAddressId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath9, emailAddressId),
          bodyParams: params
        });
      }
      async deleteEmailAddress(emailAddressId) {
        this.requireId(emailAddressId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath9, emailAddressId)
        });
      }
    };
    basePath10 = "/oauth_applications/access_tokens";
    IdPOAuthAccessTokenApi = class extends AbstractAPI {
      static {
        __name(this, "IdPOAuthAccessTokenApi");
      }
      async verifyAccessToken(accessToken) {
        return this.request({
          method: "POST",
          path: joinPaths(basePath10, "verify"),
          bodyParams: { access_token: accessToken }
        });
      }
    };
    basePath11 = "/instance";
    InstanceAPI = class extends AbstractAPI {
      static {
        __name(this, "InstanceAPI");
      }
      async get() {
        return this.request({
          method: "GET",
          path: basePath11
        });
      }
      async update(params) {
        return this.request({
          method: "PATCH",
          path: basePath11,
          bodyParams: params
        });
      }
      async updateRestrictions(params) {
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath11, "restrictions"),
          bodyParams: params
        });
      }
      async updateOrganizationSettings(params) {
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath11, "organization_settings"),
          bodyParams: params
        });
      }
    };
    basePath12 = "/invitations";
    InvitationAPI = class extends AbstractAPI {
      static {
        __name(this, "InvitationAPI");
      }
      async getInvitationList(params = {}) {
        return this.request({
          method: "GET",
          path: basePath12,
          queryParams: { ...params, paginated: true }
        });
      }
      async createInvitation(params) {
        return this.request({
          method: "POST",
          path: basePath12,
          bodyParams: params
        });
      }
      async createInvitationBulk(params) {
        return this.request({
          method: "POST",
          path: joinPaths(basePath12, "bulk"),
          bodyParams: params
        });
      }
      async revokeInvitation(invitationId) {
        this.requireId(invitationId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath12, invitationId, "revoke")
        });
      }
    };
    basePath13 = "/machines";
    MachineApi = class extends AbstractAPI {
      static {
        __name(this, "MachineApi");
      }
      async get(machineId) {
        this.requireId(machineId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath13, machineId)
        });
      }
      async list(queryParams = {}) {
        return this.request({
          method: "GET",
          path: basePath13,
          queryParams
        });
      }
      async create(bodyParams) {
        return this.request({
          method: "POST",
          path: basePath13,
          bodyParams
        });
      }
      async update(params) {
        const { machineId, ...bodyParams } = params;
        this.requireId(machineId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath13, machineId),
          bodyParams
        });
      }
      async delete(machineId) {
        this.requireId(machineId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath13, machineId)
        });
      }
      async getSecretKey(machineId) {
        this.requireId(machineId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath13, machineId, "secret_key")
        });
      }
      async rotateSecretKey(params) {
        const { machineId, previousTokenTtl } = params;
        this.requireId(machineId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath13, machineId, "secret_key", "rotate"),
          bodyParams: {
            previousTokenTtl
          }
        });
      }
      /**
       * Creates a new machine scope, allowing the specified machine to access another machine.
       *
       * @param machineId - The ID of the machine that will have access to another machine.
       * @param toMachineId - The ID of the machine that will be scoped to the current machine.
       */
      async createScope(machineId, toMachineId) {
        this.requireId(machineId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath13, machineId, "scopes"),
          bodyParams: {
            toMachineId
          }
        });
      }
      /**
       * Deletes a machine scope, removing access from one machine to another.
       *
       * @param machineId - The ID of the machine that has access to another machine.
       * @param otherMachineId - The ID of the machine that is being accessed.
       */
      async deleteScope(machineId, otherMachineId) {
        this.requireId(machineId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath13, machineId, "scopes", otherMachineId)
        });
      }
    };
    basePath14 = "/m2m_tokens";
    M2MTokenApi = class extends AbstractAPI {
      static {
        __name(this, "M2MTokenApi");
      }
      constructor() {
        super(...arguments);
        __privateAdd2(this, _M2MTokenApi_instances);
      }
      async createToken(params) {
        const { claims = null, machineSecretKey, secondsUntilExpiration = null } = params || {};
        const requestOptions = __privateMethod2(this, _M2MTokenApi_instances, createRequestOptions_fn).call(this, {
          method: "POST",
          path: basePath14,
          bodyParams: {
            secondsUntilExpiration,
            claims
          }
        }, machineSecretKey);
        return this.request(requestOptions);
      }
      async revokeToken(params) {
        const { m2mTokenId, revocationReason = null, machineSecretKey } = params;
        this.requireId(m2mTokenId);
        const requestOptions = __privateMethod2(this, _M2MTokenApi_instances, createRequestOptions_fn).call(this, {
          method: "POST",
          path: joinPaths(basePath14, m2mTokenId, "revoke"),
          bodyParams: {
            revocationReason
          }
        }, machineSecretKey);
        return this.request(requestOptions);
      }
      async verifyToken(params) {
        const { token, machineSecretKey } = params;
        const requestOptions = __privateMethod2(this, _M2MTokenApi_instances, createRequestOptions_fn).call(this, {
          method: "POST",
          path: joinPaths(basePath14, "verify"),
          bodyParams: { token }
        }, machineSecretKey);
        return this.request(requestOptions);
      }
    };
    _M2MTokenApi_instances = /* @__PURE__ */ new WeakSet();
    createRequestOptions_fn = /* @__PURE__ */ __name(function(options, machineSecretKey) {
      if (machineSecretKey) {
        return {
          ...options,
          headerParams: {
            ...options.headerParams,
            Authorization: `Bearer ${machineSecretKey}`
          }
        };
      }
      return options;
    }, "createRequestOptions_fn");
    basePath15 = "/jwks";
    JwksAPI = class extends AbstractAPI {
      static {
        __name(this, "JwksAPI");
      }
      async getJwks() {
        return this.request({
          method: "GET",
          path: basePath15
        });
      }
    };
    basePath16 = "/jwt_templates";
    JwtTemplatesApi = class extends AbstractAPI {
      static {
        __name(this, "JwtTemplatesApi");
      }
      async list(params = {}) {
        return this.request({
          method: "GET",
          path: basePath16,
          queryParams: { ...params, paginated: true }
        });
      }
      async get(templateId) {
        this.requireId(templateId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath16, templateId)
        });
      }
      async create(params) {
        return this.request({
          method: "POST",
          path: basePath16,
          bodyParams: params
        });
      }
      async update(params) {
        const { templateId, ...bodyParams } = params;
        this.requireId(templateId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath16, templateId),
          bodyParams
        });
      }
      async delete(templateId) {
        this.requireId(templateId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath16, templateId)
        });
      }
    };
    basePath17 = "/organizations";
    OrganizationAPI = class extends AbstractAPI {
      static {
        __name(this, "OrganizationAPI");
      }
      async getOrganizationList(params) {
        return this.request({
          method: "GET",
          path: basePath17,
          queryParams: params
        });
      }
      async createOrganization(params) {
        return this.request({
          method: "POST",
          path: basePath17,
          bodyParams: params
        });
      }
      async getOrganization(params) {
        const { includeMembersCount } = params;
        const organizationIdOrSlug = "organizationId" in params ? params.organizationId : params.slug;
        this.requireId(organizationIdOrSlug);
        return this.request({
          method: "GET",
          path: joinPaths(basePath17, organizationIdOrSlug),
          queryParams: {
            includeMembersCount
          }
        });
      }
      async updateOrganization(organizationId, params) {
        this.requireId(organizationId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath17, organizationId),
          bodyParams: params
        });
      }
      async updateOrganizationLogo(organizationId, params) {
        this.requireId(organizationId);
        const formData = new runtime.FormData();
        formData.append("file", params?.file);
        if (params?.uploaderUserId) {
          formData.append("uploader_user_id", params?.uploaderUserId);
        }
        return this.request({
          method: "PUT",
          path: joinPaths(basePath17, organizationId, "logo"),
          formData
        });
      }
      async deleteOrganizationLogo(organizationId) {
        this.requireId(organizationId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath17, organizationId, "logo")
        });
      }
      async updateOrganizationMetadata(organizationId, params) {
        this.requireId(organizationId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath17, organizationId, "metadata"),
          bodyParams: params
        });
      }
      async deleteOrganization(organizationId) {
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath17, organizationId)
        });
      }
      async getOrganizationMembershipList(params) {
        const { organizationId, ...queryParams } = params;
        this.requireId(organizationId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath17, organizationId, "memberships"),
          queryParams
        });
      }
      async getInstanceOrganizationMembershipList(params) {
        return this.request({
          method: "GET",
          path: "/organization_memberships",
          queryParams: params
        });
      }
      async createOrganizationMembership(params) {
        const { organizationId, ...bodyParams } = params;
        this.requireId(organizationId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath17, organizationId, "memberships"),
          bodyParams
        });
      }
      async updateOrganizationMembership(params) {
        const { organizationId, userId, ...bodyParams } = params;
        this.requireId(organizationId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath17, organizationId, "memberships", userId),
          bodyParams
        });
      }
      async updateOrganizationMembershipMetadata(params) {
        const { organizationId, userId, ...bodyParams } = params;
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath17, organizationId, "memberships", userId, "metadata"),
          bodyParams
        });
      }
      async deleteOrganizationMembership(params) {
        const { organizationId, userId } = params;
        this.requireId(organizationId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath17, organizationId, "memberships", userId)
        });
      }
      async getOrganizationInvitationList(params) {
        const { organizationId, ...queryParams } = params;
        this.requireId(organizationId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath17, organizationId, "invitations"),
          queryParams
        });
      }
      async createOrganizationInvitation(params) {
        const { organizationId, ...bodyParams } = params;
        this.requireId(organizationId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath17, organizationId, "invitations"),
          bodyParams
        });
      }
      async createOrganizationInvitationBulk(organizationId, params) {
        this.requireId(organizationId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath17, organizationId, "invitations", "bulk"),
          bodyParams: params
        });
      }
      async getOrganizationInvitation(params) {
        const { organizationId, invitationId } = params;
        this.requireId(organizationId);
        this.requireId(invitationId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath17, organizationId, "invitations", invitationId)
        });
      }
      async revokeOrganizationInvitation(params) {
        const { organizationId, invitationId, ...bodyParams } = params;
        this.requireId(organizationId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath17, organizationId, "invitations", invitationId, "revoke"),
          bodyParams
        });
      }
      async getOrganizationDomainList(params) {
        const { organizationId, ...queryParams } = params;
        this.requireId(organizationId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath17, organizationId, "domains"),
          queryParams
        });
      }
      async createOrganizationDomain(params) {
        const { organizationId, ...bodyParams } = params;
        this.requireId(organizationId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath17, organizationId, "domains"),
          bodyParams: {
            ...bodyParams,
            verified: bodyParams.verified ?? true
          }
        });
      }
      async updateOrganizationDomain(params) {
        const { organizationId, domainId, ...bodyParams } = params;
        this.requireId(organizationId);
        this.requireId(domainId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath17, organizationId, "domains", domainId),
          bodyParams
        });
      }
      async deleteOrganizationDomain(params) {
        const { organizationId, domainId } = params;
        this.requireId(organizationId);
        this.requireId(domainId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath17, organizationId, "domains", domainId)
        });
      }
    };
    basePath18 = "/oauth_applications";
    OAuthApplicationsApi = class extends AbstractAPI {
      static {
        __name(this, "OAuthApplicationsApi");
      }
      async list(params = {}) {
        return this.request({
          method: "GET",
          path: basePath18,
          queryParams: params
        });
      }
      async get(oauthApplicationId) {
        this.requireId(oauthApplicationId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath18, oauthApplicationId)
        });
      }
      async create(params) {
        return this.request({
          method: "POST",
          path: basePath18,
          bodyParams: params
        });
      }
      async update(params) {
        const { oauthApplicationId, ...bodyParams } = params;
        this.requireId(oauthApplicationId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath18, oauthApplicationId),
          bodyParams
        });
      }
      async delete(oauthApplicationId) {
        this.requireId(oauthApplicationId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath18, oauthApplicationId)
        });
      }
      async rotateSecret(oauthApplicationId) {
        this.requireId(oauthApplicationId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath18, oauthApplicationId, "rotate_secret")
        });
      }
    };
    basePath19 = "/phone_numbers";
    PhoneNumberAPI = class extends AbstractAPI {
      static {
        __name(this, "PhoneNumberAPI");
      }
      async getPhoneNumber(phoneNumberId) {
        this.requireId(phoneNumberId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath19, phoneNumberId)
        });
      }
      async createPhoneNumber(params) {
        return this.request({
          method: "POST",
          path: basePath19,
          bodyParams: params
        });
      }
      async updatePhoneNumber(phoneNumberId, params = {}) {
        this.requireId(phoneNumberId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath19, phoneNumberId),
          bodyParams: params
        });
      }
      async deletePhoneNumber(phoneNumberId) {
        this.requireId(phoneNumberId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath19, phoneNumberId)
        });
      }
    };
    basePath20 = "/proxy_checks";
    ProxyCheckAPI = class extends AbstractAPI {
      static {
        __name(this, "ProxyCheckAPI");
      }
      async verify(params) {
        return this.request({
          method: "POST",
          path: basePath20,
          bodyParams: params
        });
      }
    };
    basePath21 = "/redirect_urls";
    RedirectUrlAPI = class extends AbstractAPI {
      static {
        __name(this, "RedirectUrlAPI");
      }
      async getRedirectUrlList() {
        return this.request({
          method: "GET",
          path: basePath21,
          queryParams: { paginated: true }
        });
      }
      async getRedirectUrl(redirectUrlId) {
        this.requireId(redirectUrlId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath21, redirectUrlId)
        });
      }
      async createRedirectUrl(params) {
        return this.request({
          method: "POST",
          path: basePath21,
          bodyParams: params
        });
      }
      async deleteRedirectUrl(redirectUrlId) {
        this.requireId(redirectUrlId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath21, redirectUrlId)
        });
      }
    };
    basePath22 = "/saml_connections";
    SamlConnectionAPI = class extends AbstractAPI {
      static {
        __name(this, "SamlConnectionAPI");
      }
      async getSamlConnectionList(params = {}) {
        return this.request({
          method: "GET",
          path: basePath22,
          queryParams: params
        });
      }
      async createSamlConnection(params) {
        return this.request({
          method: "POST",
          path: basePath22,
          bodyParams: params,
          options: {
            deepSnakecaseBodyParamKeys: true
          }
        });
      }
      async getSamlConnection(samlConnectionId) {
        this.requireId(samlConnectionId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath22, samlConnectionId)
        });
      }
      async updateSamlConnection(samlConnectionId, params = {}) {
        this.requireId(samlConnectionId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath22, samlConnectionId),
          bodyParams: params,
          options: {
            deepSnakecaseBodyParamKeys: true
          }
        });
      }
      async deleteSamlConnection(samlConnectionId) {
        this.requireId(samlConnectionId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath22, samlConnectionId)
        });
      }
    };
    basePath23 = "/sessions";
    SessionAPI = class extends AbstractAPI {
      static {
        __name(this, "SessionAPI");
      }
      async getSessionList(params = {}) {
        return this.request({
          method: "GET",
          path: basePath23,
          queryParams: { ...params, paginated: true }
        });
      }
      async getSession(sessionId) {
        this.requireId(sessionId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath23, sessionId)
        });
      }
      async createSession(params) {
        return this.request({
          method: "POST",
          path: basePath23,
          bodyParams: params
        });
      }
      async revokeSession(sessionId) {
        this.requireId(sessionId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath23, sessionId, "revoke")
        });
      }
      async verifySession(sessionId, token) {
        this.requireId(sessionId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath23, sessionId, "verify"),
          bodyParams: { token }
        });
      }
      /**
       * Retrieves a session token or generates a JWT using a specified template.
       *
       * @param sessionId - The ID of the session for which to generate the token
       * @param template - Optional name of the JWT template configured in the Clerk Dashboard.
       * @param expiresInSeconds - Optional expiration time for the token in seconds.
       *   If not provided, uses the default expiration.
       *
       * @returns A promise that resolves to the generated token
       *
       * @throws {Error} When sessionId is invalid or empty
       */
      async getToken(sessionId, template, expiresInSeconds) {
        this.requireId(sessionId);
        const path = template ? joinPaths(basePath23, sessionId, "tokens", template) : joinPaths(basePath23, sessionId, "tokens");
        const requestOptions = {
          method: "POST",
          path
        };
        if (expiresInSeconds !== void 0) {
          requestOptions.bodyParams = { expires_in_seconds: expiresInSeconds };
        }
        return this.request(requestOptions);
      }
      async refreshSession(sessionId, params) {
        this.requireId(sessionId);
        const { suffixed_cookies, ...restParams } = params;
        return this.request({
          method: "POST",
          path: joinPaths(basePath23, sessionId, "refresh"),
          bodyParams: restParams,
          queryParams: { suffixed_cookies }
        });
      }
    };
    basePath24 = "/sign_in_tokens";
    SignInTokenAPI = class extends AbstractAPI {
      static {
        __name(this, "SignInTokenAPI");
      }
      async createSignInToken(params) {
        return this.request({
          method: "POST",
          path: basePath24,
          bodyParams: params
        });
      }
      async revokeSignInToken(signInTokenId) {
        this.requireId(signInTokenId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath24, signInTokenId, "revoke")
        });
      }
    };
    basePath25 = "/sign_ups";
    SignUpAPI = class extends AbstractAPI {
      static {
        __name(this, "SignUpAPI");
      }
      async get(signUpAttemptId) {
        this.requireId(signUpAttemptId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath25, signUpAttemptId)
        });
      }
      async update(params) {
        const { signUpAttemptId, ...bodyParams } = params;
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath25, signUpAttemptId),
          bodyParams
        });
      }
    };
    basePath26 = "/testing_tokens";
    TestingTokenAPI = class extends AbstractAPI {
      static {
        __name(this, "TestingTokenAPI");
      }
      async createTestingToken() {
        return this.request({
          method: "POST",
          path: basePath26
        });
      }
    };
    basePath27 = "/users";
    UserAPI = class extends AbstractAPI {
      static {
        __name(this, "UserAPI");
      }
      async getUserList(params = {}) {
        const { limit, offset, orderBy, ...userCountParams } = params;
        const [data, totalCount] = await Promise.all([
          this.request({
            method: "GET",
            path: basePath27,
            queryParams: params
          }),
          this.getCount(userCountParams)
        ]);
        return { data, totalCount };
      }
      async getUser(userId) {
        this.requireId(userId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath27, userId)
        });
      }
      async createUser(params) {
        return this.request({
          method: "POST",
          path: basePath27,
          bodyParams: params
        });
      }
      async updateUser(userId, params = {}) {
        this.requireId(userId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath27, userId),
          bodyParams: params
        });
      }
      async updateUserProfileImage(userId, params) {
        this.requireId(userId);
        const formData = new runtime.FormData();
        formData.append("file", params?.file);
        return this.request({
          method: "POST",
          path: joinPaths(basePath27, userId, "profile_image"),
          formData
        });
      }
      async updateUserMetadata(userId, params) {
        this.requireId(userId);
        return this.request({
          method: "PATCH",
          path: joinPaths(basePath27, userId, "metadata"),
          bodyParams: params
        });
      }
      async deleteUser(userId) {
        this.requireId(userId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath27, userId)
        });
      }
      async getCount(params = {}) {
        return this.request({
          method: "GET",
          path: joinPaths(basePath27, "count"),
          queryParams: params
        });
      }
      async getUserOauthAccessToken(userId, provider) {
        this.requireId(userId);
        const hasPrefix = provider.startsWith("oauth_");
        const _provider = hasPrefix ? provider : `oauth_${provider}`;
        if (hasPrefix) {
          deprecated(
            "getUserOauthAccessToken(userId, provider)",
            "Remove the `oauth_` prefix from the `provider` argument."
          );
        }
        return this.request({
          method: "GET",
          path: joinPaths(basePath27, userId, "oauth_access_tokens", _provider),
          queryParams: { paginated: true }
        });
      }
      async disableUserMFA(userId) {
        this.requireId(userId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath27, userId, "mfa")
        });
      }
      async getOrganizationMembershipList(params) {
        const { userId, limit, offset } = params;
        this.requireId(userId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath27, userId, "organization_memberships"),
          queryParams: { limit, offset }
        });
      }
      async getOrganizationInvitationList(params) {
        const { userId, ...queryParams } = params;
        this.requireId(userId);
        return this.request({
          method: "GET",
          path: joinPaths(basePath27, userId, "organization_invitations"),
          queryParams
        });
      }
      async verifyPassword(params) {
        const { userId, password } = params;
        this.requireId(userId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath27, userId, "verify_password"),
          bodyParams: { password }
        });
      }
      async verifyTOTP(params) {
        const { userId, code } = params;
        this.requireId(userId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath27, userId, "verify_totp"),
          bodyParams: { code }
        });
      }
      async banUser(userId) {
        this.requireId(userId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath27, userId, "ban")
        });
      }
      async unbanUser(userId) {
        this.requireId(userId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath27, userId, "unban")
        });
      }
      async lockUser(userId) {
        this.requireId(userId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath27, userId, "lock")
        });
      }
      async unlockUser(userId) {
        this.requireId(userId);
        return this.request({
          method: "POST",
          path: joinPaths(basePath27, userId, "unlock")
        });
      }
      async deleteUserProfileImage(userId) {
        this.requireId(userId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath27, userId, "profile_image")
        });
      }
      async deleteUserPasskey(params) {
        this.requireId(params.userId);
        this.requireId(params.passkeyIdentificationId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath27, params.userId, "passkeys", params.passkeyIdentificationId)
        });
      }
      async deleteUserWeb3Wallet(params) {
        this.requireId(params.userId);
        this.requireId(params.web3WalletIdentificationId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath27, params.userId, "web3_wallets", params.web3WalletIdentificationId)
        });
      }
      async deleteUserExternalAccount(params) {
        this.requireId(params.userId);
        this.requireId(params.externalAccountId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath27, params.userId, "external_accounts", params.externalAccountId)
        });
      }
      async deleteUserBackupCodes(userId) {
        this.requireId(userId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath27, userId, "backup_code")
        });
      }
      async deleteUserTOTP(userId) {
        this.requireId(userId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath27, userId, "totp")
        });
      }
    };
    basePath28 = "/waitlist_entries";
    WaitlistEntryAPI = class extends AbstractAPI {
      static {
        __name(this, "WaitlistEntryAPI");
      }
      async list(params = {}) {
        return this.request({
          method: "GET",
          path: basePath28,
          queryParams: params
        });
      }
      async create(params) {
        return this.request({
          method: "POST",
          path: basePath28,
          bodyParams: params
        });
      }
    };
    basePath29 = "/webhooks";
    WebhookAPI = class extends AbstractAPI {
      static {
        __name(this, "WebhookAPI");
      }
      async createSvixApp() {
        return this.request({
          method: "POST",
          path: joinPaths(basePath29, "svix")
        });
      }
      async generateSvixAuthURL() {
        return this.request({
          method: "POST",
          path: joinPaths(basePath29, "svix_url")
        });
      }
      async deleteSvixApp() {
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath29, "svix")
        });
      }
    };
    basePath30 = "/commerce";
    organizationBasePath = "/organizations";
    userBasePath = "/users";
    BillingAPI = class extends AbstractAPI {
      static {
        __name(this, "BillingAPI");
      }
      /**
       * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
       * It is advised to pin the SDK version to avoid breaking changes.
       */
      async getPlanList(params) {
        return this.request({
          method: "GET",
          path: joinPaths(basePath30, "plans"),
          queryParams: params
        });
      }
      /**
       * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
       * It is advised to pin the SDK version to avoid breaking changes.
       */
      async cancelSubscriptionItem(subscriptionItemId, params) {
        this.requireId(subscriptionItemId);
        return this.request({
          method: "DELETE",
          path: joinPaths(basePath30, "subscription_items", subscriptionItemId),
          queryParams: params
        });
      }
      /**
       * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
       * It is advised to pin the SDK version to avoid breaking changes.
       */
      async extendSubscriptionItemFreeTrial(subscriptionItemId, params) {
        this.requireId(subscriptionItemId);
        return this.request({
          method: "POST",
          path: joinPaths("/billing", "subscription_items", subscriptionItemId, "extend_free_trial"),
          bodyParams: params
        });
      }
      /**
       * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
       * It is advised to pin the SDK version to avoid breaking changes.
       */
      async getOrganizationBillingSubscription(organizationId) {
        this.requireId(organizationId);
        return this.request({
          method: "GET",
          path: joinPaths(organizationBasePath, organizationId, "billing", "subscription")
        });
      }
      /**
       * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
       * It is advised to pin the SDK version to avoid breaking changes.
       */
      async getUserBillingSubscription(userId) {
        this.requireId(userId);
        return this.request({
          method: "GET",
          path: joinPaths(userBasePath, userId, "billing", "subscription")
        });
      }
    };
    isObject = /* @__PURE__ */ __name((value) => typeof value === "object" && value !== null, "isObject");
    isObjectCustom = /* @__PURE__ */ __name((value) => isObject(value) && !(value instanceof RegExp) && !(value instanceof Error) && !(value instanceof Date) && !(globalThis.Blob && value instanceof globalThis.Blob), "isObjectCustom");
    mapObjectSkip = Symbol("mapObjectSkip");
    _mapObject = /* @__PURE__ */ __name((object, mapper, options, isSeen = /* @__PURE__ */ new WeakMap()) => {
      options = {
        deep: false,
        target: {},
        ...options
      };
      if (isSeen.has(object)) {
        return isSeen.get(object);
      }
      isSeen.set(object, options.target);
      const { target } = options;
      delete options.target;
      const mapArray = /* @__PURE__ */ __name((array) => array.map((element) => isObjectCustom(element) ? _mapObject(element, mapper, options, isSeen) : element), "mapArray");
      if (Array.isArray(object)) {
        return mapArray(object);
      }
      for (const [key, value] of Object.entries(object)) {
        const mapResult = mapper(key, value, object);
        if (mapResult === mapObjectSkip) {
          continue;
        }
        let [newKey, newValue, { shouldRecurse = true } = {}] = mapResult;
        if (newKey === "__proto__") {
          continue;
        }
        if (options.deep && shouldRecurse && isObjectCustom(newValue)) {
          newValue = Array.isArray(newValue) ? mapArray(newValue) : _mapObject(newValue, mapper, options, isSeen);
        }
        target[newKey] = newValue;
      }
      return target;
    }, "_mapObject");
    __name(mapObject, "mapObject");
    SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
    SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
    SPLIT_SEPARATE_NUMBER_RE = /(\d)\p{Ll}|(\p{L})\d/u;
    DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
    SPLIT_REPLACE_VALUE = "$1\0$2";
    DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";
    __name(split, "split");
    __name(splitSeparateNumbers, "splitSeparateNumbers");
    __name(noCase, "noCase");
    __name(snakeCase, "snakeCase");
    __name(lowerFactory, "lowerFactory");
    __name(splitPrefixSuffix, "splitPrefixSuffix");
    PlainObjectConstructor = {}.constructor;
    __name(snakecaseKeys, "snakecaseKeys");
    __name(matches, "matches");
    __name(mapperOptions, "mapperOptions");
    snakecase_keys_default = snakecaseKeys;
    AccountlessApplication = class _AccountlessApplication {
      static {
        __name(this, "_AccountlessApplication");
      }
      constructor(publishableKey, secretKey, claimUrl, apiKeysUrl) {
        this.publishableKey = publishableKey;
        this.secretKey = secretKey;
        this.claimUrl = claimUrl;
        this.apiKeysUrl = apiKeysUrl;
      }
      static fromJSON(data) {
        return new _AccountlessApplication(data.publishable_key, data.secret_key, data.claim_url, data.api_keys_url);
      }
    };
    ActorToken = class _ActorToken {
      static {
        __name(this, "_ActorToken");
      }
      constructor(id, status, userId, actor, token, url, createdAt, updatedAt) {
        this.id = id;
        this.status = status;
        this.userId = userId;
        this.actor = actor;
        this.token = token;
        this.url = url;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }
      static fromJSON(data) {
        return new _ActorToken(
          data.id,
          data.status,
          data.user_id,
          data.actor,
          data.token,
          data.url,
          data.created_at,
          data.updated_at
        );
      }
    };
    AllowlistIdentifier = class _AllowlistIdentifier {
      static {
        __name(this, "_AllowlistIdentifier");
      }
      constructor(id, identifier, identifierType, createdAt, updatedAt, instanceId, invitationId) {
        this.id = id;
        this.identifier = identifier;
        this.identifierType = identifierType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.instanceId = instanceId;
        this.invitationId = invitationId;
      }
      static fromJSON(data) {
        return new _AllowlistIdentifier(
          data.id,
          data.identifier,
          data.identifier_type,
          data.created_at,
          data.updated_at,
          data.instance_id,
          data.invitation_id
        );
      }
    };
    APIKey = class _APIKey {
      static {
        __name(this, "_APIKey");
      }
      constructor(id, type, name, subject, scopes, claims, revoked, revocationReason, expired, expiration, createdBy, description, lastUsedAt, createdAt, updatedAt, secret) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.subject = subject;
        this.scopes = scopes;
        this.claims = claims;
        this.revoked = revoked;
        this.revocationReason = revocationReason;
        this.expired = expired;
        this.expiration = expiration;
        this.createdBy = createdBy;
        this.description = description;
        this.lastUsedAt = lastUsedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.secret = secret;
      }
      static fromJSON(data) {
        return new _APIKey(
          data.id,
          data.type,
          data.name,
          data.subject,
          data.scopes,
          data.claims,
          data.revoked,
          data.revocation_reason,
          data.expired,
          data.expiration,
          data.created_by,
          data.description,
          data.last_used_at,
          data.created_at,
          data.updated_at,
          data.secret
        );
      }
    };
    BlocklistIdentifier = class _BlocklistIdentifier {
      static {
        __name(this, "_BlocklistIdentifier");
      }
      constructor(id, identifier, identifierType, createdAt, updatedAt, instanceId) {
        this.id = id;
        this.identifier = identifier;
        this.identifierType = identifierType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.instanceId = instanceId;
      }
      static fromJSON(data) {
        return new _BlocklistIdentifier(
          data.id,
          data.identifier,
          data.identifier_type,
          data.created_at,
          data.updated_at,
          data.instance_id
        );
      }
    };
    SessionActivity = class _SessionActivity {
      static {
        __name(this, "_SessionActivity");
      }
      constructor(id, isMobile, ipAddress, city, country, browserVersion, browserName, deviceType) {
        this.id = id;
        this.isMobile = isMobile;
        this.ipAddress = ipAddress;
        this.city = city;
        this.country = country;
        this.browserVersion = browserVersion;
        this.browserName = browserName;
        this.deviceType = deviceType;
      }
      static fromJSON(data) {
        return new _SessionActivity(
          data.id,
          data.is_mobile,
          data.ip_address,
          data.city,
          data.country,
          data.browser_version,
          data.browser_name,
          data.device_type
        );
      }
    };
    Session = class _Session {
      static {
        __name(this, "_Session");
      }
      constructor(id, clientId, userId, status, lastActiveAt, expireAt, abandonAt, createdAt, updatedAt, lastActiveOrganizationId, latestActivity, actor = null) {
        this.id = id;
        this.clientId = clientId;
        this.userId = userId;
        this.status = status;
        this.lastActiveAt = lastActiveAt;
        this.expireAt = expireAt;
        this.abandonAt = abandonAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastActiveOrganizationId = lastActiveOrganizationId;
        this.latestActivity = latestActivity;
        this.actor = actor;
      }
      static fromJSON(data) {
        return new _Session(
          data.id,
          data.client_id,
          data.user_id,
          data.status,
          data.last_active_at,
          data.expire_at,
          data.abandon_at,
          data.created_at,
          data.updated_at,
          data.last_active_organization_id,
          data.latest_activity && SessionActivity.fromJSON(data.latest_activity),
          data.actor
        );
      }
    };
    Client = class _Client {
      static {
        __name(this, "_Client");
      }
      constructor(id, sessionIds, sessions, signInId, signUpId, lastActiveSessionId, lastAuthenticationStrategy, createdAt, updatedAt) {
        this.id = id;
        this.sessionIds = sessionIds;
        this.sessions = sessions;
        this.signInId = signInId;
        this.signUpId = signUpId;
        this.lastActiveSessionId = lastActiveSessionId;
        this.lastAuthenticationStrategy = lastAuthenticationStrategy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }
      static fromJSON(data) {
        return new _Client(
          data.id,
          data.session_ids,
          data.sessions.map((x) => Session.fromJSON(x)),
          data.sign_in_id,
          data.sign_up_id,
          data.last_active_session_id,
          data.last_authentication_strategy,
          data.created_at,
          data.updated_at
        );
      }
    };
    CnameTarget = class _CnameTarget {
      static {
        __name(this, "_CnameTarget");
      }
      constructor(host, value, required) {
        this.host = host;
        this.value = value;
        this.required = required;
      }
      static fromJSON(data) {
        return new _CnameTarget(data.host, data.value, data.required);
      }
    };
    Cookies2 = class _Cookies {
      static {
        __name(this, "_Cookies");
      }
      constructor(cookies) {
        this.cookies = cookies;
      }
      static fromJSON(data) {
        return new _Cookies(data.cookies);
      }
    };
    DeletedObject = class _DeletedObject {
      static {
        __name(this, "_DeletedObject");
      }
      constructor(object, id, slug, deleted) {
        this.object = object;
        this.id = id;
        this.slug = slug;
        this.deleted = deleted;
      }
      static fromJSON(data) {
        return new _DeletedObject(data.object, data.id || null, data.slug || null, data.deleted);
      }
    };
    Domain = class _Domain {
      static {
        __name(this, "_Domain");
      }
      constructor(id, name, isSatellite, frontendApiUrl, developmentOrigin, cnameTargets, accountsPortalUrl, proxyUrl) {
        this.id = id;
        this.name = name;
        this.isSatellite = isSatellite;
        this.frontendApiUrl = frontendApiUrl;
        this.developmentOrigin = developmentOrigin;
        this.cnameTargets = cnameTargets;
        this.accountsPortalUrl = accountsPortalUrl;
        this.proxyUrl = proxyUrl;
      }
      static fromJSON(data) {
        return new _Domain(
          data.id,
          data.name,
          data.is_satellite,
          data.frontend_api_url,
          data.development_origin,
          data.cname_targets && data.cname_targets.map((x) => CnameTarget.fromJSON(x)),
          data.accounts_portal_url,
          data.proxy_url
        );
      }
    };
    Email = class _Email {
      static {
        __name(this, "_Email");
      }
      constructor(id, fromEmailName, emailAddressId, toEmailAddress, subject, body, bodyPlain, status, slug, data, deliveredByClerk) {
        this.id = id;
        this.fromEmailName = fromEmailName;
        this.emailAddressId = emailAddressId;
        this.toEmailAddress = toEmailAddress;
        this.subject = subject;
        this.body = body;
        this.bodyPlain = bodyPlain;
        this.status = status;
        this.slug = slug;
        this.data = data;
        this.deliveredByClerk = deliveredByClerk;
      }
      static fromJSON(data) {
        return new _Email(
          data.id,
          data.from_email_name,
          data.email_address_id,
          data.to_email_address,
          data.subject,
          data.body,
          data.body_plain,
          data.status,
          data.slug,
          data.data,
          data.delivered_by_clerk
        );
      }
    };
    IdentificationLink = class _IdentificationLink {
      static {
        __name(this, "_IdentificationLink");
      }
      constructor(id, type) {
        this.id = id;
        this.type = type;
      }
      static fromJSON(data) {
        return new _IdentificationLink(data.id, data.type);
      }
    };
    Verification = class _Verification {
      static {
        __name(this, "_Verification");
      }
      constructor(status, strategy, externalVerificationRedirectURL = null, attempts = null, expireAt = null, nonce = null, message = null) {
        this.status = status;
        this.strategy = strategy;
        this.externalVerificationRedirectURL = externalVerificationRedirectURL;
        this.attempts = attempts;
        this.expireAt = expireAt;
        this.nonce = nonce;
        this.message = message;
      }
      static fromJSON(data) {
        return new _Verification(
          data.status,
          data.strategy,
          data.external_verification_redirect_url ? new URL(data.external_verification_redirect_url) : null,
          data.attempts,
          data.expire_at,
          data.nonce
        );
      }
    };
    EmailAddress = class _EmailAddress {
      static {
        __name(this, "_EmailAddress");
      }
      constructor(id, emailAddress, verification, linkedTo) {
        this.id = id;
        this.emailAddress = emailAddress;
        this.verification = verification;
        this.linkedTo = linkedTo;
      }
      static fromJSON(data) {
        return new _EmailAddress(
          data.id,
          data.email_address,
          data.verification && Verification.fromJSON(data.verification),
          data.linked_to.map((link) => IdentificationLink.fromJSON(link))
        );
      }
    };
    ExternalAccount = class _ExternalAccount {
      static {
        __name(this, "_ExternalAccount");
      }
      constructor(id, provider, identificationId, externalId, approvedScopes, emailAddress, firstName, lastName, imageUrl, username, phoneNumber, publicMetadata = {}, label, verification) {
        this.id = id;
        this.provider = provider;
        this.identificationId = identificationId;
        this.externalId = externalId;
        this.approvedScopes = approvedScopes;
        this.emailAddress = emailAddress;
        this.firstName = firstName;
        this.lastName = lastName;
        this.imageUrl = imageUrl;
        this.username = username;
        this.phoneNumber = phoneNumber;
        this.publicMetadata = publicMetadata;
        this.label = label;
        this.verification = verification;
      }
      static fromJSON(data) {
        return new _ExternalAccount(
          data.id,
          data.provider,
          data.identification_id,
          data.provider_user_id,
          data.approved_scopes,
          data.email_address,
          data.first_name,
          data.last_name,
          data.image_url || "",
          data.username,
          data.phone_number,
          data.public_metadata,
          data.label,
          data.verification && Verification.fromJSON(data.verification)
        );
      }
    };
    IdPOAuthAccessToken = class _IdPOAuthAccessToken {
      static {
        __name(this, "_IdPOAuthAccessToken");
      }
      constructor(id, clientId, type, subject, scopes, revoked, revocationReason, expired, expiration, createdAt, updatedAt) {
        this.id = id;
        this.clientId = clientId;
        this.type = type;
        this.subject = subject;
        this.scopes = scopes;
        this.revoked = revoked;
        this.revocationReason = revocationReason;
        this.expired = expired;
        this.expiration = expiration;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }
      static fromJSON(data) {
        return new _IdPOAuthAccessToken(
          data.id,
          data.client_id,
          data.type,
          data.subject,
          data.scopes,
          data.revoked,
          data.revocation_reason,
          data.expired,
          data.expiration,
          data.created_at,
          data.updated_at
        );
      }
    };
    Instance = class _Instance {
      static {
        __name(this, "_Instance");
      }
      constructor(id, environmentType, allowedOrigins) {
        this.id = id;
        this.environmentType = environmentType;
        this.allowedOrigins = allowedOrigins;
      }
      static fromJSON(data) {
        return new _Instance(data.id, data.environment_type, data.allowed_origins);
      }
    };
    InstanceRestrictions = class _InstanceRestrictions {
      static {
        __name(this, "_InstanceRestrictions");
      }
      constructor(allowlist, blocklist, blockEmailSubaddresses, blockDisposableEmailDomains, ignoreDotsForGmailAddresses) {
        this.allowlist = allowlist;
        this.blocklist = blocklist;
        this.blockEmailSubaddresses = blockEmailSubaddresses;
        this.blockDisposableEmailDomains = blockDisposableEmailDomains;
        this.ignoreDotsForGmailAddresses = ignoreDotsForGmailAddresses;
      }
      static fromJSON(data) {
        return new _InstanceRestrictions(
          data.allowlist,
          data.blocklist,
          data.block_email_subaddresses,
          data.block_disposable_email_domains,
          data.ignore_dots_for_gmail_addresses
        );
      }
    };
    InstanceSettings = class _InstanceSettings {
      static {
        __name(this, "_InstanceSettings");
      }
      constructor(id, restrictedToAllowlist, fromEmailAddress, progressiveSignUp, enhancedEmailDeliverability) {
        this.id = id;
        this.restrictedToAllowlist = restrictedToAllowlist;
        this.fromEmailAddress = fromEmailAddress;
        this.progressiveSignUp = progressiveSignUp;
        this.enhancedEmailDeliverability = enhancedEmailDeliverability;
      }
      static fromJSON(data) {
        return new _InstanceSettings(
          data.id,
          data.restricted_to_allowlist,
          data.from_email_address,
          data.progressive_sign_up,
          data.enhanced_email_deliverability
        );
      }
    };
    Invitation = class _Invitation {
      static {
        __name(this, "_Invitation");
      }
      constructor(id, emailAddress, publicMetadata, createdAt, updatedAt, status, url, revoked) {
        this.id = id;
        this.emailAddress = emailAddress;
        this.publicMetadata = publicMetadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
        this.url = url;
        this.revoked = revoked;
        this._raw = null;
      }
      get raw() {
        return this._raw;
      }
      static fromJSON(data) {
        const res = new _Invitation(
          data.id,
          data.email_address,
          data.public_metadata,
          data.created_at,
          data.updated_at,
          data.status,
          data.url,
          data.revoked
        );
        res._raw = data;
        return res;
      }
    };
    ObjectType = {
      AccountlessApplication: "accountless_application",
      ActorToken: "actor_token",
      AllowlistIdentifier: "allowlist_identifier",
      ApiKey: "api_key",
      BlocklistIdentifier: "blocklist_identifier",
      Client: "client",
      Cookies: "cookies",
      Domain: "domain",
      Email: "email",
      EmailAddress: "email_address",
      ExternalAccount: "external_account",
      FacebookAccount: "facebook_account",
      GoogleAccount: "google_account",
      Instance: "instance",
      InstanceRestrictions: "instance_restrictions",
      InstanceSettings: "instance_settings",
      Invitation: "invitation",
      Machine: "machine",
      MachineScope: "machine_scope",
      MachineSecretKey: "machine_secret_key",
      M2MToken: "machine_to_machine_token",
      JwtTemplate: "jwt_template",
      OauthAccessToken: "oauth_access_token",
      IdpOAuthAccessToken: "clerk_idp_oauth_access_token",
      OAuthApplication: "oauth_application",
      Organization: "organization",
      OrganizationDomain: "organization_domain",
      OrganizationInvitation: "organization_invitation",
      OrganizationMembership: "organization_membership",
      OrganizationSettings: "organization_settings",
      PhoneNumber: "phone_number",
      ProxyCheck: "proxy_check",
      RedirectUrl: "redirect_url",
      SamlAccount: "saml_account",
      SamlConnection: "saml_connection",
      Session: "session",
      SignInAttempt: "sign_in_attempt",
      SignInToken: "sign_in_token",
      SignUpAttempt: "sign_up_attempt",
      SmsMessage: "sms_message",
      User: "user",
      WaitlistEntry: "waitlist_entry",
      Web3Wallet: "web3_wallet",
      Token: "token",
      TotalCount: "total_count",
      TestingToken: "testing_token",
      Role: "role",
      Permission: "permission",
      CommercePayer: "commerce_payer",
      CommercePaymentAttempt: "commerce_payment_attempt",
      CommerceSubscription: "commerce_subscription",
      CommerceSubscriptionItem: "commerce_subscription_item",
      CommercePlan: "commerce_plan",
      Feature: "feature"
    };
    Machine = class _Machine {
      static {
        __name(this, "_Machine");
      }
      constructor(id, name, instanceId, createdAt, updatedAt, scopedMachines, defaultTokenTtl, secretKey) {
        this.id = id;
        this.name = name;
        this.instanceId = instanceId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.scopedMachines = scopedMachines;
        this.defaultTokenTtl = defaultTokenTtl;
        this.secretKey = secretKey;
      }
      static fromJSON(data) {
        return new _Machine(
          data.id,
          data.name,
          data.instance_id,
          data.created_at,
          data.updated_at,
          data.scoped_machines.map(
            (m) => new _Machine(
              m.id,
              m.name,
              m.instance_id,
              m.created_at,
              m.updated_at,
              [],
              // Nested machines don't have scoped_machines
              m.default_token_ttl
            )
          ),
          data.default_token_ttl,
          data.secret_key
        );
      }
    };
    MachineScope = class _MachineScope {
      static {
        __name(this, "_MachineScope");
      }
      constructor(fromMachineId, toMachineId, createdAt, deleted) {
        this.fromMachineId = fromMachineId;
        this.toMachineId = toMachineId;
        this.createdAt = createdAt;
        this.deleted = deleted;
      }
      static fromJSON(data) {
        return new _MachineScope(data.from_machine_id, data.to_machine_id, data.created_at, data.deleted);
      }
    };
    MachineSecretKey = class _MachineSecretKey {
      static {
        __name(this, "_MachineSecretKey");
      }
      constructor(secret) {
        this.secret = secret;
      }
      static fromJSON(data) {
        return new _MachineSecretKey(data.secret);
      }
    };
    M2MToken = class _M2MToken {
      static {
        __name(this, "_M2MToken");
      }
      constructor(id, subject, scopes, claims, revoked, revocationReason, expired, expiration, createdAt, updatedAt, token) {
        this.id = id;
        this.subject = subject;
        this.scopes = scopes;
        this.claims = claims;
        this.revoked = revoked;
        this.revocationReason = revocationReason;
        this.expired = expired;
        this.expiration = expiration;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.token = token;
      }
      static fromJSON(data) {
        return new _M2MToken(
          data.id,
          data.subject,
          data.scopes,
          data.claims,
          data.revoked,
          data.revocation_reason,
          data.expired,
          data.expiration,
          data.created_at,
          data.updated_at,
          data.token
        );
      }
    };
    JwtTemplate = class _JwtTemplate {
      static {
        __name(this, "_JwtTemplate");
      }
      constructor(id, name, claims, lifetime, allowedClockSkew, customSigningKey, signingAlgorithm, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.claims = claims;
        this.lifetime = lifetime;
        this.allowedClockSkew = allowedClockSkew;
        this.customSigningKey = customSigningKey;
        this.signingAlgorithm = signingAlgorithm;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }
      static fromJSON(data) {
        return new _JwtTemplate(
          data.id,
          data.name,
          data.claims,
          data.lifetime,
          data.allowed_clock_skew,
          data.custom_signing_key,
          data.signing_algorithm,
          data.created_at,
          data.updated_at
        );
      }
    };
    OauthAccessToken = class _OauthAccessToken {
      static {
        __name(this, "_OauthAccessToken");
      }
      constructor(externalAccountId, provider, token, publicMetadata = {}, label, scopes, tokenSecret, expiresAt) {
        this.externalAccountId = externalAccountId;
        this.provider = provider;
        this.token = token;
        this.publicMetadata = publicMetadata;
        this.label = label;
        this.scopes = scopes;
        this.tokenSecret = tokenSecret;
        this.expiresAt = expiresAt;
      }
      static fromJSON(data) {
        return new _OauthAccessToken(
          data.external_account_id,
          data.provider,
          data.token,
          data.public_metadata,
          data.label || "",
          data.scopes,
          data.token_secret,
          data.expires_at
        );
      }
    };
    OAuthApplication = class _OAuthApplication {
      static {
        __name(this, "_OAuthApplication");
      }
      constructor(id, instanceId, name, clientId, clientUri, clientImageUrl, dynamicallyRegistered, consentScreenEnabled, pkceRequired, isPublic, scopes, redirectUris, authorizeUrl, tokenFetchUrl, userInfoUrl, discoveryUrl, tokenIntrospectionUrl, createdAt, updatedAt, clientSecret) {
        this.id = id;
        this.instanceId = instanceId;
        this.name = name;
        this.clientId = clientId;
        this.clientUri = clientUri;
        this.clientImageUrl = clientImageUrl;
        this.dynamicallyRegistered = dynamicallyRegistered;
        this.consentScreenEnabled = consentScreenEnabled;
        this.pkceRequired = pkceRequired;
        this.isPublic = isPublic;
        this.scopes = scopes;
        this.redirectUris = redirectUris;
        this.authorizeUrl = authorizeUrl;
        this.tokenFetchUrl = tokenFetchUrl;
        this.userInfoUrl = userInfoUrl;
        this.discoveryUrl = discoveryUrl;
        this.tokenIntrospectionUrl = tokenIntrospectionUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.clientSecret = clientSecret;
      }
      static fromJSON(data) {
        return new _OAuthApplication(
          data.id,
          data.instance_id,
          data.name,
          data.client_id,
          data.client_uri,
          data.client_image_url,
          data.dynamically_registered,
          data.consent_screen_enabled,
          data.pkce_required,
          data.public,
          data.scopes,
          data.redirect_uris,
          data.authorize_url,
          data.token_fetch_url,
          data.user_info_url,
          data.discovery_url,
          data.token_introspection_url,
          data.created_at,
          data.updated_at,
          data.client_secret
        );
      }
    };
    Organization = class _Organization {
      static {
        __name(this, "_Organization");
      }
      constructor(id, name, slug, imageUrl, hasImage, createdAt, updatedAt, publicMetadata = {}, privateMetadata = {}, maxAllowedMemberships, adminDeleteEnabled, membersCount, createdBy) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.imageUrl = imageUrl;
        this.hasImage = hasImage;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.publicMetadata = publicMetadata;
        this.privateMetadata = privateMetadata;
        this.maxAllowedMemberships = maxAllowedMemberships;
        this.adminDeleteEnabled = adminDeleteEnabled;
        this.membersCount = membersCount;
        this.createdBy = createdBy;
        this._raw = null;
      }
      get raw() {
        return this._raw;
      }
      static fromJSON(data) {
        const res = new _Organization(
          data.id,
          data.name,
          data.slug,
          data.image_url || "",
          data.has_image,
          data.created_at,
          data.updated_at,
          data.public_metadata,
          data.private_metadata,
          data.max_allowed_memberships,
          data.admin_delete_enabled,
          data.members_count,
          data.created_by
        );
        res._raw = data;
        return res;
      }
    };
    OrganizationInvitation = class _OrganizationInvitation {
      static {
        __name(this, "_OrganizationInvitation");
      }
      constructor(id, emailAddress, role, roleName, organizationId, createdAt, updatedAt, expiresAt, url, status, publicMetadata = {}, privateMetadata = {}, publicOrganizationData) {
        this.id = id;
        this.emailAddress = emailAddress;
        this.role = role;
        this.roleName = roleName;
        this.organizationId = organizationId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.expiresAt = expiresAt;
        this.url = url;
        this.status = status;
        this.publicMetadata = publicMetadata;
        this.privateMetadata = privateMetadata;
        this.publicOrganizationData = publicOrganizationData;
        this._raw = null;
      }
      get raw() {
        return this._raw;
      }
      static fromJSON(data) {
        const res = new _OrganizationInvitation(
          data.id,
          data.email_address,
          data.role,
          data.role_name,
          data.organization_id,
          data.created_at,
          data.updated_at,
          data.expires_at,
          data.url,
          data.status,
          data.public_metadata,
          data.private_metadata,
          data.public_organization_data
        );
        res._raw = data;
        return res;
      }
    };
    OrganizationMembership = class _OrganizationMembership {
      static {
        __name(this, "_OrganizationMembership");
      }
      constructor(id, role, permissions, publicMetadata = {}, privateMetadata = {}, createdAt, updatedAt, organization, publicUserData) {
        this.id = id;
        this.role = role;
        this.permissions = permissions;
        this.publicMetadata = publicMetadata;
        this.privateMetadata = privateMetadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.organization = organization;
        this.publicUserData = publicUserData;
        this._raw = null;
      }
      get raw() {
        return this._raw;
      }
      static fromJSON(data) {
        const res = new _OrganizationMembership(
          data.id,
          data.role,
          data.permissions,
          data.public_metadata,
          data.private_metadata,
          data.created_at,
          data.updated_at,
          Organization.fromJSON(data.organization),
          OrganizationMembershipPublicUserData.fromJSON(data.public_user_data)
        );
        res._raw = data;
        return res;
      }
    };
    OrganizationMembershipPublicUserData = class _OrganizationMembershipPublicUserData {
      static {
        __name(this, "_OrganizationMembershipPublicUserData");
      }
      constructor(identifier, firstName, lastName, imageUrl, hasImage, userId) {
        this.identifier = identifier;
        this.firstName = firstName;
        this.lastName = lastName;
        this.imageUrl = imageUrl;
        this.hasImage = hasImage;
        this.userId = userId;
      }
      static fromJSON(data) {
        return new _OrganizationMembershipPublicUserData(
          data.identifier,
          data.first_name,
          data.last_name,
          data.image_url,
          data.has_image,
          data.user_id
        );
      }
    };
    OrganizationSettings = class _OrganizationSettings {
      static {
        __name(this, "_OrganizationSettings");
      }
      constructor(enabled, maxAllowedMemberships, maxAllowedRoles, maxAllowedPermissions, creatorRole, adminDeleteEnabled, domainsEnabled, domainsEnrollmentModes, domainsDefaultRole) {
        this.enabled = enabled;
        this.maxAllowedMemberships = maxAllowedMemberships;
        this.maxAllowedRoles = maxAllowedRoles;
        this.maxAllowedPermissions = maxAllowedPermissions;
        this.creatorRole = creatorRole;
        this.adminDeleteEnabled = adminDeleteEnabled;
        this.domainsEnabled = domainsEnabled;
        this.domainsEnrollmentModes = domainsEnrollmentModes;
        this.domainsDefaultRole = domainsDefaultRole;
      }
      static fromJSON(data) {
        return new _OrganizationSettings(
          data.enabled,
          data.max_allowed_memberships,
          data.max_allowed_roles,
          data.max_allowed_permissions,
          data.creator_role,
          data.admin_delete_enabled,
          data.domains_enabled,
          data.domains_enrollment_modes,
          data.domains_default_role
        );
      }
    };
    PhoneNumber = class _PhoneNumber {
      static {
        __name(this, "_PhoneNumber");
      }
      constructor(id, phoneNumber, reservedForSecondFactor, defaultSecondFactor, verification, linkedTo) {
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.reservedForSecondFactor = reservedForSecondFactor;
        this.defaultSecondFactor = defaultSecondFactor;
        this.verification = verification;
        this.linkedTo = linkedTo;
      }
      static fromJSON(data) {
        return new _PhoneNumber(
          data.id,
          data.phone_number,
          data.reserved_for_second_factor,
          data.default_second_factor,
          data.verification && Verification.fromJSON(data.verification),
          data.linked_to.map((link) => IdentificationLink.fromJSON(link))
        );
      }
    };
    ProxyCheck = class _ProxyCheck {
      static {
        __name(this, "_ProxyCheck");
      }
      constructor(id, domainId, lastRunAt, proxyUrl, successful, createdAt, updatedAt) {
        this.id = id;
        this.domainId = domainId;
        this.lastRunAt = lastRunAt;
        this.proxyUrl = proxyUrl;
        this.successful = successful;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }
      static fromJSON(data) {
        return new _ProxyCheck(
          data.id,
          data.domain_id,
          data.last_run_at,
          data.proxy_url,
          data.successful,
          data.created_at,
          data.updated_at
        );
      }
    };
    RedirectUrl = class _RedirectUrl {
      static {
        __name(this, "_RedirectUrl");
      }
      constructor(id, url, createdAt, updatedAt) {
        this.id = id;
        this.url = url;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }
      static fromJSON(data) {
        return new _RedirectUrl(data.id, data.url, data.created_at, data.updated_at);
      }
    };
    SamlConnection = class _SamlConnection {
      static {
        __name(this, "_SamlConnection");
      }
      constructor(id, name, domain, organizationId, idpEntityId, idpSsoUrl, idpCertificate, idpMetadataUrl, idpMetadata, acsUrl, spEntityId, spMetadataUrl, active, provider, userCount, syncUserAttributes, allowSubdomains, allowIdpInitiated, createdAt, updatedAt, attributeMapping) {
        this.id = id;
        this.name = name;
        this.domain = domain;
        this.organizationId = organizationId;
        this.idpEntityId = idpEntityId;
        this.idpSsoUrl = idpSsoUrl;
        this.idpCertificate = idpCertificate;
        this.idpMetadataUrl = idpMetadataUrl;
        this.idpMetadata = idpMetadata;
        this.acsUrl = acsUrl;
        this.spEntityId = spEntityId;
        this.spMetadataUrl = spMetadataUrl;
        this.active = active;
        this.provider = provider;
        this.userCount = userCount;
        this.syncUserAttributes = syncUserAttributes;
        this.allowSubdomains = allowSubdomains;
        this.allowIdpInitiated = allowIdpInitiated;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.attributeMapping = attributeMapping;
      }
      static fromJSON(data) {
        return new _SamlConnection(
          data.id,
          data.name,
          data.domain,
          data.organization_id,
          data.idp_entity_id,
          data.idp_sso_url,
          data.idp_certificate,
          data.idp_metadata_url,
          data.idp_metadata,
          data.acs_url,
          data.sp_entity_id,
          data.sp_metadata_url,
          data.active,
          data.provider,
          data.user_count,
          data.sync_user_attributes,
          data.allow_subdomains,
          data.allow_idp_initiated,
          data.created_at,
          data.updated_at,
          data.attribute_mapping && AttributeMapping.fromJSON(data.attribute_mapping)
        );
      }
    };
    SamlAccountConnection = class _SamlAccountConnection {
      static {
        __name(this, "_SamlAccountConnection");
      }
      constructor(id, name, domain, active, provider, syncUserAttributes, allowSubdomains, allowIdpInitiated, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.domain = domain;
        this.active = active;
        this.provider = provider;
        this.syncUserAttributes = syncUserAttributes;
        this.allowSubdomains = allowSubdomains;
        this.allowIdpInitiated = allowIdpInitiated;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }
      static fromJSON(data) {
        return new _SamlAccountConnection(
          data.id,
          data.name,
          data.domain,
          data.active,
          data.provider,
          data.sync_user_attributes,
          data.allow_subdomains,
          data.allow_idp_initiated,
          data.created_at,
          data.updated_at
        );
      }
    };
    AttributeMapping = class _AttributeMapping {
      static {
        __name(this, "_AttributeMapping");
      }
      constructor(userId, emailAddress, firstName, lastName) {
        this.userId = userId;
        this.emailAddress = emailAddress;
        this.firstName = firstName;
        this.lastName = lastName;
      }
      static fromJSON(data) {
        return new _AttributeMapping(data.user_id, data.email_address, data.first_name, data.last_name);
      }
    };
    SamlAccount = class _SamlAccount {
      static {
        __name(this, "_SamlAccount");
      }
      constructor(id, provider, providerUserId, active, emailAddress, firstName, lastName, verification, samlConnection) {
        this.id = id;
        this.provider = provider;
        this.providerUserId = providerUserId;
        this.active = active;
        this.emailAddress = emailAddress;
        this.firstName = firstName;
        this.lastName = lastName;
        this.verification = verification;
        this.samlConnection = samlConnection;
      }
      static fromJSON(data) {
        return new _SamlAccount(
          data.id,
          data.provider,
          data.provider_user_id,
          data.active,
          data.email_address,
          data.first_name,
          data.last_name,
          data.verification && Verification.fromJSON(data.verification),
          data.saml_connection && SamlAccountConnection.fromJSON(data.saml_connection)
        );
      }
    };
    SignInToken = class _SignInToken {
      static {
        __name(this, "_SignInToken");
      }
      constructor(id, userId, token, status, url, createdAt, updatedAt) {
        this.id = id;
        this.userId = userId;
        this.token = token;
        this.status = status;
        this.url = url;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }
      static fromJSON(data) {
        return new _SignInToken(data.id, data.user_id, data.token, data.status, data.url, data.created_at, data.updated_at);
      }
    };
    SignUpAttemptVerification = class _SignUpAttemptVerification {
      static {
        __name(this, "_SignUpAttemptVerification");
      }
      constructor(nextAction, supportedStrategies) {
        this.nextAction = nextAction;
        this.supportedStrategies = supportedStrategies;
      }
      static fromJSON(data) {
        return new _SignUpAttemptVerification(data.next_action, data.supported_strategies);
      }
    };
    SignUpAttemptVerifications = class _SignUpAttemptVerifications {
      static {
        __name(this, "_SignUpAttemptVerifications");
      }
      constructor(emailAddress, phoneNumber, web3Wallet, externalAccount) {
        this.emailAddress = emailAddress;
        this.phoneNumber = phoneNumber;
        this.web3Wallet = web3Wallet;
        this.externalAccount = externalAccount;
      }
      static fromJSON(data) {
        return new _SignUpAttemptVerifications(
          data.email_address && SignUpAttemptVerification.fromJSON(data.email_address),
          data.phone_number && SignUpAttemptVerification.fromJSON(data.phone_number),
          data.web3_wallet && SignUpAttemptVerification.fromJSON(data.web3_wallet),
          data.external_account
        );
      }
    };
    SignUpAttempt = class _SignUpAttempt {
      static {
        __name(this, "_SignUpAttempt");
      }
      constructor(id, status, requiredFields, optionalFields, missingFields, unverifiedFields, verifications, username, emailAddress, phoneNumber, web3Wallet, passwordEnabled, firstName, lastName, customAction, externalId, createdSessionId, createdUserId, abandonAt, legalAcceptedAt, publicMetadata, unsafeMetadata) {
        this.id = id;
        this.status = status;
        this.requiredFields = requiredFields;
        this.optionalFields = optionalFields;
        this.missingFields = missingFields;
        this.unverifiedFields = unverifiedFields;
        this.verifications = verifications;
        this.username = username;
        this.emailAddress = emailAddress;
        this.phoneNumber = phoneNumber;
        this.web3Wallet = web3Wallet;
        this.passwordEnabled = passwordEnabled;
        this.firstName = firstName;
        this.lastName = lastName;
        this.customAction = customAction;
        this.externalId = externalId;
        this.createdSessionId = createdSessionId;
        this.createdUserId = createdUserId;
        this.abandonAt = abandonAt;
        this.legalAcceptedAt = legalAcceptedAt;
        this.publicMetadata = publicMetadata;
        this.unsafeMetadata = unsafeMetadata;
      }
      static fromJSON(data) {
        return new _SignUpAttempt(
          data.id,
          data.status,
          data.required_fields,
          data.optional_fields,
          data.missing_fields,
          data.unverified_fields,
          data.verifications ? SignUpAttemptVerifications.fromJSON(data.verifications) : null,
          data.username,
          data.email_address,
          data.phone_number,
          data.web3_wallet,
          data.password_enabled,
          data.first_name,
          data.last_name,
          data.custom_action,
          data.external_id,
          data.created_session_id,
          data.created_user_id,
          data.abandon_at,
          data.legal_accepted_at,
          data.public_metadata,
          data.unsafe_metadata
        );
      }
    };
    SMSMessage = class _SMSMessage {
      static {
        __name(this, "_SMSMessage");
      }
      constructor(id, fromPhoneNumber, toPhoneNumber, message, status, phoneNumberId, data) {
        this.id = id;
        this.fromPhoneNumber = fromPhoneNumber;
        this.toPhoneNumber = toPhoneNumber;
        this.message = message;
        this.status = status;
        this.phoneNumberId = phoneNumberId;
        this.data = data;
      }
      static fromJSON(data) {
        return new _SMSMessage(
          data.id,
          data.from_phone_number,
          data.to_phone_number,
          data.message,
          data.status,
          data.phone_number_id,
          data.data
        );
      }
    };
    Token = class _Token {
      static {
        __name(this, "_Token");
      }
      constructor(jwt) {
        this.jwt = jwt;
      }
      static fromJSON(data) {
        return new _Token(data.jwt);
      }
    };
    Web3Wallet = class _Web3Wallet {
      static {
        __name(this, "_Web3Wallet");
      }
      constructor(id, web3Wallet, verification) {
        this.id = id;
        this.web3Wallet = web3Wallet;
        this.verification = verification;
      }
      static fromJSON(data) {
        return new _Web3Wallet(data.id, data.web3_wallet, data.verification && Verification.fromJSON(data.verification));
      }
    };
    User = class _User {
      static {
        __name(this, "_User");
      }
      constructor(id, passwordEnabled, totpEnabled, backupCodeEnabled, twoFactorEnabled, banned, locked, createdAt, updatedAt, imageUrl, hasImage, primaryEmailAddressId, primaryPhoneNumberId, primaryWeb3WalletId, lastSignInAt, externalId, username, firstName, lastName, publicMetadata = {}, privateMetadata = {}, unsafeMetadata = {}, emailAddresses = [], phoneNumbers = [], web3Wallets = [], externalAccounts = [], samlAccounts = [], lastActiveAt, createOrganizationEnabled, createOrganizationsLimit = null, deleteSelfEnabled, legalAcceptedAt) {
        this.id = id;
        this.passwordEnabled = passwordEnabled;
        this.totpEnabled = totpEnabled;
        this.backupCodeEnabled = backupCodeEnabled;
        this.twoFactorEnabled = twoFactorEnabled;
        this.banned = banned;
        this.locked = locked;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.imageUrl = imageUrl;
        this.hasImage = hasImage;
        this.primaryEmailAddressId = primaryEmailAddressId;
        this.primaryPhoneNumberId = primaryPhoneNumberId;
        this.primaryWeb3WalletId = primaryWeb3WalletId;
        this.lastSignInAt = lastSignInAt;
        this.externalId = externalId;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.publicMetadata = publicMetadata;
        this.privateMetadata = privateMetadata;
        this.unsafeMetadata = unsafeMetadata;
        this.emailAddresses = emailAddresses;
        this.phoneNumbers = phoneNumbers;
        this.web3Wallets = web3Wallets;
        this.externalAccounts = externalAccounts;
        this.samlAccounts = samlAccounts;
        this.lastActiveAt = lastActiveAt;
        this.createOrganizationEnabled = createOrganizationEnabled;
        this.createOrganizationsLimit = createOrganizationsLimit;
        this.deleteSelfEnabled = deleteSelfEnabled;
        this.legalAcceptedAt = legalAcceptedAt;
        this._raw = null;
      }
      get raw() {
        return this._raw;
      }
      static fromJSON(data) {
        const res = new _User(
          data.id,
          data.password_enabled,
          data.totp_enabled,
          data.backup_code_enabled,
          data.two_factor_enabled,
          data.banned,
          data.locked,
          data.created_at,
          data.updated_at,
          data.image_url,
          data.has_image,
          data.primary_email_address_id,
          data.primary_phone_number_id,
          data.primary_web3_wallet_id,
          data.last_sign_in_at,
          data.external_id,
          data.username,
          data.first_name,
          data.last_name,
          data.public_metadata,
          data.private_metadata,
          data.unsafe_metadata,
          (data.email_addresses || []).map((x) => EmailAddress.fromJSON(x)),
          (data.phone_numbers || []).map((x) => PhoneNumber.fromJSON(x)),
          (data.web3_wallets || []).map((x) => Web3Wallet.fromJSON(x)),
          (data.external_accounts || []).map((x) => ExternalAccount.fromJSON(x)),
          (data.saml_accounts || []).map((x) => SamlAccount.fromJSON(x)),
          data.last_active_at,
          data.create_organization_enabled,
          data.create_organizations_limit,
          data.delete_self_enabled,
          data.legal_accepted_at
        );
        res._raw = data;
        return res;
      }
      /**
       * The primary email address of the user.
       */
      get primaryEmailAddress() {
        return this.emailAddresses.find(({ id }) => id === this.primaryEmailAddressId) ?? null;
      }
      /**
       * The primary phone number of the user.
       */
      get primaryPhoneNumber() {
        return this.phoneNumbers.find(({ id }) => id === this.primaryPhoneNumberId) ?? null;
      }
      /**
       * The primary web3 wallet of the user.
       */
      get primaryWeb3Wallet() {
        return this.web3Wallets.find(({ id }) => id === this.primaryWeb3WalletId) ?? null;
      }
      /**
       * The full name of the user.
       */
      get fullName() {
        return [this.firstName, this.lastName].join(" ").trim() || null;
      }
    };
    WaitlistEntry = class _WaitlistEntry {
      static {
        __name(this, "_WaitlistEntry");
      }
      constructor(id, emailAddress, status, invitation, createdAt, updatedAt, isLocked) {
        this.id = id;
        this.emailAddress = emailAddress;
        this.status = status;
        this.invitation = invitation;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isLocked = isLocked;
      }
      static fromJSON(data) {
        return new _WaitlistEntry(
          data.id,
          data.email_address,
          data.status,
          data.invitation && Invitation.fromJSON(data.invitation),
          data.created_at,
          data.updated_at,
          data.is_locked
        );
      }
    };
    Feature = class _Feature {
      static {
        __name(this, "_Feature");
      }
      constructor(id, name, description, slug, avatarUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.slug = slug;
        this.avatarUrl = avatarUrl;
      }
      static fromJSON(data) {
        return new _Feature(data.id, data.name, data.description, data.slug, data.avatar_url);
      }
    };
    CommercePlan = class _CommercePlan {
      static {
        __name(this, "_CommercePlan");
      }
      constructor(id, productId, name, slug, description, isDefault, isRecurring, hasBaseFee, publiclyVisible, fee, annualFee, annualMonthlyFee, forPayerType, features) {
        this.id = id;
        this.productId = productId;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.isDefault = isDefault;
        this.isRecurring = isRecurring;
        this.hasBaseFee = hasBaseFee;
        this.publiclyVisible = publiclyVisible;
        this.fee = fee;
        this.annualFee = annualFee;
        this.annualMonthlyFee = annualMonthlyFee;
        this.forPayerType = forPayerType;
        this.features = features;
      }
      static fromJSON(data) {
        const formatAmountJSON = /* @__PURE__ */ __name((fee) => {
          return {
            amount: fee.amount,
            amountFormatted: fee.amount_formatted,
            currency: fee.currency,
            currencySymbol: fee.currency_symbol
          };
        }, "formatAmountJSON");
        return new _CommercePlan(
          data.id,
          data.product_id,
          data.name,
          data.slug,
          data.description,
          data.is_default,
          data.is_recurring,
          data.has_base_fee,
          data.publicly_visible,
          formatAmountJSON(data.fee),
          formatAmountJSON(data.annual_fee),
          formatAmountJSON(data.annual_monthly_fee),
          data.for_payer_type,
          data.features.map((feature) => Feature.fromJSON(feature))
        );
      }
    };
    CommerceSubscriptionItem = class _CommerceSubscriptionItem {
      static {
        __name(this, "_CommerceSubscriptionItem");
      }
      constructor(id, status, planPeriod, periodStart, nextPayment, amount, plan, planId, createdAt, updatedAt, periodEnd, canceledAt, pastDueAt, endedAt, payerId, isFreeTrial, lifetimePaid) {
        this.id = id;
        this.status = status;
        this.planPeriod = planPeriod;
        this.periodStart = periodStart;
        this.nextPayment = nextPayment;
        this.amount = amount;
        this.plan = plan;
        this.planId = planId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.periodEnd = periodEnd;
        this.canceledAt = canceledAt;
        this.pastDueAt = pastDueAt;
        this.endedAt = endedAt;
        this.payerId = payerId;
        this.isFreeTrial = isFreeTrial;
        this.lifetimePaid = lifetimePaid;
      }
      static fromJSON(data) {
        function formatAmountJSON(amount) {
          if (!amount) {
            return amount;
          }
          return {
            amount: amount.amount,
            amountFormatted: amount.amount_formatted,
            currency: amount.currency,
            currencySymbol: amount.currency_symbol
          };
        }
        __name(formatAmountJSON, "formatAmountJSON");
        return new _CommerceSubscriptionItem(
          data.id,
          data.status,
          data.plan_period,
          data.period_start,
          data.next_payment,
          formatAmountJSON(data.amount),
          CommercePlan.fromJSON(data.plan),
          data.plan_id,
          data.created_at,
          data.updated_at,
          data.period_end,
          data.canceled_at,
          data.past_due_at,
          data.ended_at,
          data.payer_id,
          data.is_free_trial,
          formatAmountJSON(data.lifetime_paid)
        );
      }
    };
    CommerceSubscription = class _CommerceSubscription {
      static {
        __name(this, "_CommerceSubscription");
      }
      constructor(id, status, payerId, createdAt, updatedAt, activeAt, pastDueAt, subscriptionItems, nextPayment, eligibleForFreeTrial) {
        this.id = id;
        this.status = status;
        this.payerId = payerId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.activeAt = activeAt;
        this.pastDueAt = pastDueAt;
        this.subscriptionItems = subscriptionItems;
        this.nextPayment = nextPayment;
        this.eligibleForFreeTrial = eligibleForFreeTrial;
      }
      static fromJSON(data) {
        const nextPayment = data.next_payment ? {
          date: data.next_payment.date,
          amount: {
            amount: data.next_payment.amount.amount,
            amountFormatted: data.next_payment.amount.amount_formatted,
            currency: data.next_payment.amount.currency,
            currencySymbol: data.next_payment.amount.currency_symbol
          }
        } : null;
        return new _CommerceSubscription(
          data.id,
          data.status,
          data.payer_id,
          data.created_at,
          data.updated_at,
          data.active_at ?? null,
          data.past_due_at ?? null,
          data.subscription_items.map((item) => CommerceSubscriptionItem.fromJSON(item)),
          nextPayment,
          data.eligible_for_free_trial ?? false
        );
      }
    };
    __name(deserialize, "deserialize");
    __name(isPaginated, "isPaginated");
    __name(getCount, "getCount");
    __name(jsonToObject, "jsonToObject");
    __name(buildRequest, "buildRequest");
    __name(getTraceId, "getTraceId");
    __name(getRetryAfter, "getRetryAfter");
    __name(parseErrors2, "parseErrors");
    __name(withLegacyRequestReturn, "withLegacyRequestReturn");
    __name(createBackendApiClient, "createBackendApiClient");
    M2M_TOKEN_PREFIX = "mt_";
    OAUTH_TOKEN_PREFIX = "oat_";
    API_KEY_PREFIX = "ak_";
    MACHINE_TOKEN_PREFIXES = [M2M_TOKEN_PREFIX, OAUTH_TOKEN_PREFIX, API_KEY_PREFIX];
    __name(isMachineTokenByPrefix, "isMachineTokenByPrefix");
    __name(getMachineTokenType, "getMachineTokenType");
    isTokenTypeAccepted = /* @__PURE__ */ __name((tokenType, acceptsToken) => {
      if (!tokenType) {
        return false;
      }
      if (acceptsToken === "any") {
        return true;
      }
      const tokenTypes = Array.isArray(acceptsToken) ? acceptsToken : [acceptsToken];
      return tokenTypes.includes(tokenType);
    }, "isTokenTypeAccepted");
    createDebug = /* @__PURE__ */ __name((data) => {
      return () => {
        const res = { ...data };
        res.secretKey = (res.secretKey || "").substring(0, 7);
        res.jwtKey = (res.jwtKey || "").substring(0, 7);
        return { ...res };
      };
    }, "createDebug");
    __name(signedInAuthObject, "signedInAuthObject");
    __name(signedOutAuthObject, "signedOutAuthObject");
    __name(authenticatedMachineObject, "authenticatedMachineObject");
    __name(unauthenticatedMachineObject, "unauthenticatedMachineObject");
    __name(invalidTokenAuthObject, "invalidTokenAuthObject");
    createGetToken = /* @__PURE__ */ __name((params) => {
      const { fetcher, sessionToken, sessionId } = params || {};
      return async (options = {}) => {
        if (!sessionId) {
          return null;
        }
        if (options.template || options.expiresInSeconds !== void 0) {
          return fetcher(sessionId, options.template, options.expiresInSeconds);
        }
        return sessionToken;
      };
    }, "createGetToken");
    AuthStatus = {
      SignedIn: "signed-in",
      SignedOut: "signed-out",
      Handshake: "handshake"
    };
    AuthErrorReason = {
      ClientUATWithoutSessionToken: "client-uat-but-no-session-token",
      DevBrowserMissing: "dev-browser-missing",
      DevBrowserSync: "dev-browser-sync",
      PrimaryRespondsToSyncing: "primary-responds-to-syncing",
      PrimaryDomainCrossOriginSync: "primary-domain-cross-origin-sync",
      SatelliteCookieNeedsSyncing: "satellite-needs-syncing",
      SessionTokenAndUATMissing: "session-token-and-uat-missing",
      SessionTokenMissing: "session-token-missing",
      SessionTokenExpired: "session-token-expired",
      SessionTokenIATBeforeClientUAT: "session-token-iat-before-client-uat",
      SessionTokenNBF: "session-token-nbf",
      SessionTokenIatInTheFuture: "session-token-iat-in-the-future",
      SessionTokenWithoutClientUAT: "session-token-but-no-client-uat",
      ActiveOrganizationMismatch: "active-organization-mismatch",
      TokenTypeMismatch: "token-type-mismatch",
      UnexpectedError: "unexpected-error"
    };
    __name(signedIn, "signedIn");
    __name(signedOut, "signedOut");
    __name(handshake, "handshake");
    __name(signedOutInvalidToken, "signedOutInvalidToken");
    withDebugHeaders = /* @__PURE__ */ __name((requestState) => {
      const headers = new Headers(requestState.headers || {});
      if (requestState.message) {
        try {
          headers.set(constants.Headers.AuthMessage, requestState.message);
        } catch {
        }
      }
      if (requestState.reason) {
        try {
          headers.set(constants.Headers.AuthReason, requestState.reason);
        } catch {
        }
      }
      if (requestState.status) {
        try {
          headers.set(constants.Headers.AuthStatus, requestState.status);
        } catch {
        }
      }
      requestState.headers = headers;
      return requestState;
    }, "withDebugHeaders");
    ClerkUrl = class extends URL {
      static {
        __name(this, "ClerkUrl");
      }
      isCrossOrigin(other) {
        return this.origin !== new URL(other.toString()).origin;
      }
    };
    createClerkUrl = /* @__PURE__ */ __name((...args) => {
      return new ClerkUrl(...args);
    }, "createClerkUrl");
    ClerkRequest = class extends Request {
      static {
        __name(this, "ClerkRequest");
      }
      constructor(input, init) {
        const url = typeof input !== "string" && "url" in input ? input.url : String(input);
        super(url, init || typeof input === "string" ? void 0 : input);
        this.clerkUrl = this.deriveUrlFromHeaders(this);
        this.cookies = this.parseCookies(this);
      }
      toJSON() {
        return {
          url: this.clerkUrl.href,
          method: this.method,
          headers: JSON.stringify(Object.fromEntries(this.headers)),
          clerkUrl: this.clerkUrl.toString(),
          cookies: JSON.stringify(Object.fromEntries(this.cookies))
        };
      }
      /**
       * Used to fix request.url using the x-forwarded-* headers
       * TODO add detailed description of the issues this solves
       */
      deriveUrlFromHeaders(req) {
        const initialUrl = new URL(req.url);
        const forwardedProto = req.headers.get(constants.Headers.ForwardedProto);
        const forwardedHost = req.headers.get(constants.Headers.ForwardedHost);
        const host = req.headers.get(constants.Headers.Host);
        const protocol = initialUrl.protocol;
        const resolvedHost = this.getFirstValueFromHeader(forwardedHost) ?? host;
        const resolvedProtocol = this.getFirstValueFromHeader(forwardedProto) ?? protocol?.replace(/[:/]/, "");
        const origin = resolvedHost && resolvedProtocol ? `${resolvedProtocol}://${resolvedHost}` : initialUrl.origin;
        if (origin === initialUrl.origin) {
          return createClerkUrl(initialUrl);
        }
        return createClerkUrl(initialUrl.pathname + initialUrl.search, origin);
      }
      getFirstValueFromHeader(value) {
        return value?.split(",")[0];
      }
      parseCookies(req) {
        const cookiesRecord = (0, import_cookie.parse)(this.decodeCookieValue(req.headers.get("cookie") || ""));
        return new Map(Object.entries(cookiesRecord));
      }
      decodeCookieValue(str) {
        return str ? str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent) : str;
      }
    };
    createClerkRequest = /* @__PURE__ */ __name((...args) => {
      return args[0] instanceof ClerkRequest ? args[0] : new ClerkRequest(...args);
    }, "createClerkRequest");
    getCookieName = /* @__PURE__ */ __name((cookieDirective) => {
      return cookieDirective.split(";")[0]?.split("=")[0];
    }, "getCookieName");
    getCookieValue = /* @__PURE__ */ __name((cookieDirective) => {
      return cookieDirective.split(";")[0]?.split("=")[1];
    }, "getCookieValue");
    cache = {};
    lastUpdatedAt = 0;
    __name(getFromCache, "getFromCache");
    __name(getCacheValues, "getCacheValues");
    __name(setInCache, "setInCache");
    LocalJwkKid = "local";
    PEM_HEADER = "-----BEGIN PUBLIC KEY-----";
    PEM_TRAILER = "-----END PUBLIC KEY-----";
    RSA_PREFIX = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA";
    RSA_SUFFIX = "IDAQAB";
    __name(loadClerkJWKFromLocal, "loadClerkJWKFromLocal");
    __name(loadClerkJWKFromRemote, "loadClerkJWKFromRemote");
    __name(fetchJWKSFromBAPI, "fetchJWKSFromBAPI");
    __name(cacheHasExpired, "cacheHasExpired");
    getErrorObjectByCode = /* @__PURE__ */ __name((errors, code) => {
      if (!errors) {
        return null;
      }
      return errors.find((err) => err.code === code);
    }, "getErrorObjectByCode");
    __name(verifyToken, "verifyToken");
    __name(handleClerkAPIError, "handleClerkAPIError");
    __name(verifyM2MToken, "verifyM2MToken");
    __name(verifyOAuthToken, "verifyOAuthToken");
    __name(verifyAPIKey, "verifyAPIKey");
    __name(verifyMachineAuthToken, "verifyMachineAuthToken");
    __name(verifyHandshakeJwt, "verifyHandshakeJwt");
    __name(verifyHandshakeToken, "verifyHandshakeToken");
    HandshakeService = class {
      static {
        __name(this, "HandshakeService");
      }
      constructor(authenticateContext, options, organizationMatcher) {
        this.authenticateContext = authenticateContext;
        this.options = options;
        this.organizationMatcher = organizationMatcher;
      }
      /**
       * Determines if a request is eligible for handshake based on its headers
       *
       * Currently, a request is only eligible for a handshake if we can say it's *probably* a request for a document, not a fetch or some other exotic request.
       * This heuristic should give us a reliable enough signal for browsers that support `Sec-Fetch-Dest` and for those that don't.
       *
       * @returns boolean indicating if the request is eligible for handshake
       */
      isRequestEligibleForHandshake() {
        const { accept, secFetchDest } = this.authenticateContext;
        if (secFetchDest === "document" || secFetchDest === "iframe") {
          return true;
        }
        if (!secFetchDest && accept?.startsWith("text/html")) {
          return true;
        }
        return false;
      }
      /**
       * Builds the redirect headers for a handshake request
       * @param reason - The reason for the handshake (e.g. 'session-token-expired')
       * @returns Headers object containing the Location header for redirect
       * @throws Error if clerkUrl is missing in authenticateContext
       */
      buildRedirectToHandshake(reason) {
        if (!this.authenticateContext?.clerkUrl) {
          throw new Error("Missing clerkUrl in authenticateContext");
        }
        const redirectUrl = this.removeDevBrowserFromURL(this.authenticateContext.clerkUrl);
        let baseUrl = this.authenticateContext.frontendApi.startsWith("http") ? this.authenticateContext.frontendApi : `https://${this.authenticateContext.frontendApi}`;
        baseUrl = baseUrl.replace(/\/+$/, "") + "/";
        const url = new URL("v1/client/handshake", baseUrl);
        url.searchParams.append("redirect_url", redirectUrl?.href || "");
        url.searchParams.append("__clerk_api_version", SUPPORTED_BAPI_VERSION);
        url.searchParams.append(
          constants.QueryParameters.SuffixedCookies,
          this.authenticateContext.usesSuffixedCookies().toString()
        );
        url.searchParams.append(constants.QueryParameters.HandshakeReason, reason);
        url.searchParams.append(constants.QueryParameters.HandshakeFormat, "nonce");
        if (this.authenticateContext.instanceType === "development" && this.authenticateContext.devBrowserToken) {
          url.searchParams.append(constants.QueryParameters.DevBrowser, this.authenticateContext.devBrowserToken);
        }
        const toActivate = this.getOrganizationSyncTarget(this.authenticateContext.clerkUrl, this.organizationMatcher);
        if (toActivate) {
          const params = this.getOrganizationSyncQueryParams(toActivate);
          params.forEach((value, key) => {
            url.searchParams.append(key, value);
          });
        }
        return new Headers({ [constants.Headers.Location]: url.href });
      }
      /**
       * Gets cookies from either a handshake nonce or a handshake token
       * @returns Promise resolving to string array of cookie directives
       */
      async getCookiesFromHandshake() {
        const cookiesToSet = [];
        if (this.authenticateContext.handshakeNonce) {
          try {
            const handshakePayload = await this.authenticateContext.apiClient?.clients.getHandshakePayload({
              nonce: this.authenticateContext.handshakeNonce
            });
            if (handshakePayload) {
              cookiesToSet.push(...handshakePayload.directives);
            }
          } catch (error) {
            console.error("Clerk: HandshakeService: error getting handshake payload:", error);
          }
        } else if (this.authenticateContext.handshakeToken) {
          const handshakePayload = await verifyHandshakeToken(
            this.authenticateContext.handshakeToken,
            this.authenticateContext
          );
          if (handshakePayload && Array.isArray(handshakePayload.handshake)) {
            cookiesToSet.push(...handshakePayload.handshake);
          }
        }
        return cookiesToSet;
      }
      /**
       * Resolves a handshake request by verifying the handshake token and setting appropriate cookies
       * @returns Promise resolving to either a SignedInState or SignedOutState
       * @throws Error if handshake verification fails or if there are issues with the session token
       */
      async resolveHandshake() {
        const headers = new Headers({
          "Access-Control-Allow-Origin": "null",
          "Access-Control-Allow-Credentials": "true"
        });
        const cookiesToSet = await this.getCookiesFromHandshake();
        let sessionToken = "";
        cookiesToSet.forEach((x) => {
          headers.append("Set-Cookie", x);
          if (getCookieName(x).startsWith(constants.Cookies.Session)) {
            sessionToken = getCookieValue(x);
          }
        });
        if (this.authenticateContext.instanceType === "development") {
          const newUrl = new URL(this.authenticateContext.clerkUrl);
          newUrl.searchParams.delete(constants.QueryParameters.Handshake);
          newUrl.searchParams.delete(constants.QueryParameters.HandshakeHelp);
          newUrl.searchParams.delete(constants.QueryParameters.DevBrowser);
          headers.append(constants.Headers.Location, newUrl.toString());
          headers.set(constants.Headers.CacheControl, "no-store");
        }
        if (sessionToken === "") {
          return signedOut({
            tokenType: TokenType.SessionToken,
            authenticateContext: this.authenticateContext,
            reason: AuthErrorReason.SessionTokenMissing,
            message: "",
            headers
          });
        }
        const { data, errors: [error] = [] } = await verifyToken(sessionToken, this.authenticateContext);
        if (data) {
          return signedIn({
            tokenType: TokenType.SessionToken,
            authenticateContext: this.authenticateContext,
            sessionClaims: data,
            headers,
            token: sessionToken
          });
        }
        if (this.authenticateContext.instanceType === "development" && (error?.reason === TokenVerificationErrorReason.TokenExpired || error?.reason === TokenVerificationErrorReason.TokenNotActiveYet || error?.reason === TokenVerificationErrorReason.TokenIatInTheFuture)) {
          const developmentError = new TokenVerificationError({
            action: error.action,
            message: error.message,
            reason: error.reason
          });
          developmentError.tokenCarrier = "cookie";
          console.error(
            `Clerk: Clock skew detected. This usually means that your system clock is inaccurate. Clerk will attempt to account for the clock skew in development.

To resolve this issue, make sure your system's clock is set to the correct time (e.g. turn off and on automatic time synchronization).

---

${developmentError.getFullMessage()}`
          );
          const { data: retryResult, errors: [retryError] = [] } = await verifyToken(sessionToken, {
            ...this.authenticateContext,
            clockSkewInMs: 864e5
          });
          if (retryResult) {
            return signedIn({
              tokenType: TokenType.SessionToken,
              authenticateContext: this.authenticateContext,
              sessionClaims: retryResult,
              headers,
              token: sessionToken
            });
          }
          throw new Error(retryError?.message || "Clerk: Handshake retry failed.");
        }
        throw new Error(error?.message || "Clerk: Handshake failed.");
      }
      /**
       * Handles handshake token verification errors in development mode
       * @param error - The TokenVerificationError that occurred
       * @throws Error with a descriptive message about the verification failure
       */
      handleTokenVerificationErrorInDevelopment(error) {
        if (error.reason === TokenVerificationErrorReason.TokenInvalidSignature) {
          const msg = `Clerk: Handshake token verification failed due to an invalid signature. If you have switched Clerk keys locally, clear your cookies and try again.`;
          throw new Error(msg);
        }
        throw new Error(`Clerk: Handshake token verification failed: ${error.getFullMessage()}.`);
      }
      /**
       * Checks if a redirect loop is detected and sets headers to track redirect count
       * @param headers - The Headers object to modify
       * @returns boolean indicating if a redirect loop was detected (true) or if the request can proceed (false)
       */
      checkAndTrackRedirectLoop(headers) {
        if (this.authenticateContext.handshakeRedirectLoopCounter === 3) {
          return true;
        }
        const newCounterValue = this.authenticateContext.handshakeRedirectLoopCounter + 1;
        const cookieName = constants.Cookies.RedirectCount;
        headers.append("Set-Cookie", `${cookieName}=${newCounterValue}; SameSite=Lax; HttpOnly; Max-Age=2`);
        return false;
      }
      removeDevBrowserFromURL(url) {
        const updatedURL = new URL(url);
        updatedURL.searchParams.delete(constants.QueryParameters.DevBrowser);
        updatedURL.searchParams.delete(constants.QueryParameters.LegacyDevBrowser);
        return updatedURL;
      }
      getOrganizationSyncTarget(url, matchers) {
        return matchers.findTarget(url);
      }
      getOrganizationSyncQueryParams(toActivate) {
        const ret = /* @__PURE__ */ new Map();
        if (toActivate.type === "personalAccount") {
          ret.set("organization_id", "");
        }
        if (toActivate.type === "organization") {
          if (toActivate.organizationId) {
            ret.set("organization_id", toActivate.organizationId);
          }
          if (toActivate.organizationSlug) {
            ret.set("organization_id", toActivate.organizationSlug);
          }
        }
        return ret;
      }
    };
    OrganizationMatcher = class {
      static {
        __name(this, "OrganizationMatcher");
      }
      constructor(options) {
        this.organizationPattern = this.createMatcher(options?.organizationPatterns);
        this.personalAccountPattern = this.createMatcher(options?.personalAccountPatterns);
      }
      createMatcher(pattern) {
        if (!pattern) {
          return null;
        }
        try {
          return match(pattern);
        } catch (e) {
          throw new Error(`Invalid pattern "${pattern}": ${e}`);
        }
      }
      findTarget(url) {
        const orgTarget = this.findOrganizationTarget(url);
        if (orgTarget) {
          return orgTarget;
        }
        return this.findPersonalAccountTarget(url);
      }
      findOrganizationTarget(url) {
        if (!this.organizationPattern) {
          return null;
        }
        try {
          const result = this.organizationPattern(url.pathname);
          if (!result || !("params" in result)) {
            return null;
          }
          const params = result.params;
          if (params.id) {
            return { type: "organization", organizationId: params.id };
          }
          if (params.slug) {
            return { type: "organization", organizationSlug: params.slug };
          }
          return null;
        } catch (e) {
          console.error("Failed to match organization pattern:", e);
          return null;
        }
      }
      findPersonalAccountTarget(url) {
        if (!this.personalAccountPattern) {
          return null;
        }
        try {
          const result = this.personalAccountPattern(url.pathname);
          return result ? { type: "personalAccount" } : null;
        } catch (e) {
          console.error("Failed to match personal account pattern:", e);
          return null;
        }
      }
    };
    RefreshTokenErrorReason = {
      NonEligibleNoCookie: "non-eligible-no-refresh-cookie",
      NonEligibleNonGet: "non-eligible-non-get",
      InvalidSessionToken: "invalid-session-token",
      MissingApiClient: "missing-api-client",
      MissingSessionToken: "missing-session-token",
      MissingRefreshToken: "missing-refresh-token",
      ExpiredSessionTokenDecodeFailed: "expired-session-token-decode-failed",
      ExpiredSessionTokenMissingSidClaim: "expired-session-token-missing-sid-claim",
      FetchError: "fetch-error",
      UnexpectedSDKError: "unexpected-sdk-error",
      UnexpectedBAPIError: "unexpected-bapi-error"
    };
    __name(assertSignInUrlExists, "assertSignInUrlExists");
    __name(assertProxyUrlOrDomain, "assertProxyUrlOrDomain");
    __name(assertSignInUrlFormatAndOrigin, "assertSignInUrlFormatAndOrigin");
    __name(assertMachineSecretOrSecretKey, "assertMachineSecretOrSecretKey");
    __name(isRequestEligibleForRefresh, "isRequestEligibleForRefresh");
    __name(checkTokenTypeMismatch, "checkTokenTypeMismatch");
    __name(isTokenTypeInAcceptedArray, "isTokenTypeInAcceptedArray");
    authenticateRequest = /* @__PURE__ */ __name(async (request, options) => {
      const authenticateContext = await createAuthenticateContext(createClerkRequest(request), options);
      const acceptsToken = options.acceptsToken ?? TokenType.SessionToken;
      if (acceptsToken !== TokenType.M2MToken) {
        assertValidSecretKey(authenticateContext.secretKey);
        if (authenticateContext.isSatellite) {
          assertSignInUrlExists(authenticateContext.signInUrl, authenticateContext.secretKey);
          if (authenticateContext.signInUrl && authenticateContext.origin) {
            assertSignInUrlFormatAndOrigin(authenticateContext.signInUrl, authenticateContext.origin);
          }
          assertProxyUrlOrDomain(authenticateContext.proxyUrl || authenticateContext.domain);
        }
      }
      if (acceptsToken === TokenType.M2MToken) {
        assertMachineSecretOrSecretKey(authenticateContext);
      }
      const organizationMatcher = new OrganizationMatcher(options.organizationSyncOptions);
      const handshakeService = new HandshakeService(
        authenticateContext,
        { organizationSyncOptions: options.organizationSyncOptions },
        organizationMatcher
      );
      async function refreshToken(authenticateContext2) {
        if (!options.apiClient) {
          return {
            data: null,
            error: {
              message: "An apiClient is needed to perform token refresh.",
              cause: { reason: RefreshTokenErrorReason.MissingApiClient }
            }
          };
        }
        const { sessionToken: expiredSessionToken, refreshTokenInCookie: refreshToken2 } = authenticateContext2;
        if (!expiredSessionToken) {
          return {
            data: null,
            error: {
              message: "Session token must be provided.",
              cause: { reason: RefreshTokenErrorReason.MissingSessionToken }
            }
          };
        }
        if (!refreshToken2) {
          return {
            data: null,
            error: {
              message: "Refresh token must be provided.",
              cause: { reason: RefreshTokenErrorReason.MissingRefreshToken }
            }
          };
        }
        const { data: decodeResult, errors: decodedErrors } = decodeJwt(expiredSessionToken);
        if (!decodeResult || decodedErrors) {
          return {
            data: null,
            error: {
              message: "Unable to decode the expired session token.",
              cause: { reason: RefreshTokenErrorReason.ExpiredSessionTokenDecodeFailed, errors: decodedErrors }
            }
          };
        }
        if (!decodeResult?.payload?.sid) {
          return {
            data: null,
            error: {
              message: "Expired session token is missing the `sid` claim.",
              cause: { reason: RefreshTokenErrorReason.ExpiredSessionTokenMissingSidClaim }
            }
          };
        }
        try {
          const response = await options.apiClient.sessions.refreshSession(decodeResult.payload.sid, {
            format: "cookie",
            suffixed_cookies: authenticateContext2.usesSuffixedCookies(),
            expired_token: expiredSessionToken || "",
            refresh_token: refreshToken2 || "",
            request_origin: authenticateContext2.clerkUrl.origin,
            // The refresh endpoint expects headers as Record<string, string[]>, so we need to transform it.
            request_headers: Object.fromEntries(Array.from(request.headers.entries()).map(([k, v]) => [k, [v]]))
          });
          return { data: response.cookies, error: null };
        } catch (err) {
          if (err?.errors?.length) {
            if (err.errors[0].code === "unexpected_error") {
              return {
                data: null,
                error: {
                  message: `Fetch unexpected error`,
                  cause: { reason: RefreshTokenErrorReason.FetchError, errors: err.errors }
                }
              };
            }
            return {
              data: null,
              error: {
                message: err.errors[0].code,
                cause: { reason: err.errors[0].code, errors: err.errors }
              }
            };
          } else {
            return {
              data: null,
              error: {
                message: `Unexpected Server/BAPI error`,
                cause: { reason: RefreshTokenErrorReason.UnexpectedBAPIError, errors: [err] }
              }
            };
          }
        }
      }
      __name(refreshToken, "refreshToken");
      async function attemptRefresh(authenticateContext2) {
        const { data: cookiesToSet, error } = await refreshToken(authenticateContext2);
        if (!cookiesToSet || cookiesToSet.length === 0) {
          return { data: null, error };
        }
        const headers = new Headers();
        let sessionToken = "";
        cookiesToSet.forEach((x) => {
          headers.append("Set-Cookie", x);
          if (getCookieName(x).startsWith(constants.Cookies.Session)) {
            sessionToken = getCookieValue(x);
          }
        });
        const { data: jwtPayload, errors } = await verifyToken(sessionToken, authenticateContext2);
        if (errors) {
          return {
            data: null,
            error: {
              message: `Clerk: unable to verify refreshed session token.`,
              cause: { reason: RefreshTokenErrorReason.InvalidSessionToken, errors }
            }
          };
        }
        return { data: { jwtPayload, sessionToken, headers }, error: null };
      }
      __name(attemptRefresh, "attemptRefresh");
      function handleMaybeHandshakeStatus(authenticateContext2, reason, message, headers) {
        if (!handshakeService.isRequestEligibleForHandshake()) {
          return signedOut({
            tokenType: TokenType.SessionToken,
            authenticateContext: authenticateContext2,
            reason,
            message
          });
        }
        const handshakeHeaders = headers ?? handshakeService.buildRedirectToHandshake(reason);
        if (handshakeHeaders.get(constants.Headers.Location)) {
          handshakeHeaders.set(constants.Headers.CacheControl, "no-store");
        }
        const isRedirectLoop = handshakeService.checkAndTrackRedirectLoop(handshakeHeaders);
        if (isRedirectLoop) {
          const msg = `Clerk: Refreshing the session token resulted in an infinite redirect loop. This usually means that your Clerk instance keys do not match - make sure to copy the correct publishable and secret keys from the Clerk dashboard.`;
          console.log(msg);
          return signedOut({
            tokenType: TokenType.SessionToken,
            authenticateContext: authenticateContext2,
            reason,
            message
          });
        }
        return handshake(authenticateContext2, reason, message, handshakeHeaders);
      }
      __name(handleMaybeHandshakeStatus, "handleMaybeHandshakeStatus");
      function handleMaybeOrganizationSyncHandshake(authenticateContext2, auth) {
        const organizationSyncTarget = organizationMatcher.findTarget(authenticateContext2.clerkUrl);
        if (!organizationSyncTarget) {
          return null;
        }
        let mustActivate = false;
        if (organizationSyncTarget.type === "organization") {
          if (organizationSyncTarget.organizationSlug && organizationSyncTarget.organizationSlug !== auth.orgSlug) {
            mustActivate = true;
          }
          if (organizationSyncTarget.organizationId && organizationSyncTarget.organizationId !== auth.orgId) {
            mustActivate = true;
          }
        }
        if (organizationSyncTarget.type === "personalAccount" && auth.orgId) {
          mustActivate = true;
        }
        if (!mustActivate) {
          return null;
        }
        if (authenticateContext2.handshakeRedirectLoopCounter >= 3) {
          console.warn(
            "Clerk: Organization activation handshake loop detected. This is likely due to an invalid organization ID or slug. Skipping organization activation."
          );
          return null;
        }
        const handshakeState = handleMaybeHandshakeStatus(
          authenticateContext2,
          AuthErrorReason.ActiveOrganizationMismatch,
          ""
        );
        if (handshakeState.status !== "handshake") {
          return null;
        }
        return handshakeState;
      }
      __name(handleMaybeOrganizationSyncHandshake, "handleMaybeOrganizationSyncHandshake");
      async function authenticateRequestWithTokenInHeader() {
        const { tokenInHeader } = authenticateContext;
        try {
          const { data, errors } = await verifyToken(tokenInHeader, authenticateContext);
          if (errors) {
            throw errors[0];
          }
          return signedIn({
            tokenType: TokenType.SessionToken,
            authenticateContext,
            sessionClaims: data,
            headers: new Headers(),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            token: tokenInHeader
          });
        } catch (err) {
          return handleSessionTokenError(err, "header");
        }
      }
      __name(authenticateRequestWithTokenInHeader, "authenticateRequestWithTokenInHeader");
      async function authenticateRequestWithTokenInCookie() {
        const hasActiveClient = authenticateContext.clientUat;
        const hasSessionToken = !!authenticateContext.sessionTokenInCookie;
        const hasDevBrowserToken = !!authenticateContext.devBrowserToken;
        if (authenticateContext.handshakeNonce || authenticateContext.handshakeToken) {
          try {
            return await handshakeService.resolveHandshake();
          } catch (error) {
            if (error instanceof TokenVerificationError && authenticateContext.instanceType === "development") {
              handshakeService.handleTokenVerificationErrorInDevelopment(error);
            } else {
              console.error("Clerk: unable to resolve handshake:", error);
            }
          }
        }
        if (authenticateContext.instanceType === "development" && authenticateContext.clerkUrl.searchParams.has(constants.QueryParameters.DevBrowser)) {
          return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.DevBrowserSync, "");
        }
        const isRequestEligibleForMultiDomainSync = authenticateContext.isSatellite && authenticateContext.secFetchDest === "document";
        if (authenticateContext.instanceType === "production" && isRequestEligibleForMultiDomainSync) {
          return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, "");
        }
        if (authenticateContext.instanceType === "development" && isRequestEligibleForMultiDomainSync && !authenticateContext.clerkUrl.searchParams.has(constants.QueryParameters.ClerkSynced)) {
          const redirectURL = new URL(authenticateContext.signInUrl);
          redirectURL.searchParams.append(
            constants.QueryParameters.ClerkRedirectUrl,
            authenticateContext.clerkUrl.toString()
          );
          const headers = new Headers({ [constants.Headers.Location]: redirectURL.toString() });
          return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, "", headers);
        }
        const redirectUrl = new URL(authenticateContext.clerkUrl).searchParams.get(
          constants.QueryParameters.ClerkRedirectUrl
        );
        if (authenticateContext.instanceType === "development" && !authenticateContext.isSatellite && redirectUrl) {
          const redirectBackToSatelliteUrl = new URL(redirectUrl);
          if (authenticateContext.devBrowserToken) {
            redirectBackToSatelliteUrl.searchParams.append(
              constants.QueryParameters.DevBrowser,
              authenticateContext.devBrowserToken
            );
          }
          redirectBackToSatelliteUrl.searchParams.append(constants.QueryParameters.ClerkSynced, "true");
          const headers = new Headers({ [constants.Headers.Location]: redirectBackToSatelliteUrl.toString() });
          return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.PrimaryRespondsToSyncing, "", headers);
        }
        if (authenticateContext.instanceType === "development" && !hasDevBrowserToken) {
          return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.DevBrowserMissing, "");
        }
        if (!hasActiveClient && !hasSessionToken) {
          return signedOut({
            tokenType: TokenType.SessionToken,
            authenticateContext,
            reason: AuthErrorReason.SessionTokenAndUATMissing
          });
        }
        if (!hasActiveClient && hasSessionToken) {
          return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SessionTokenWithoutClientUAT, "");
        }
        if (hasActiveClient && !hasSessionToken) {
          return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.ClientUATWithoutSessionToken, "");
        }
        const { data: decodeResult, errors: decodedErrors } = decodeJwt(authenticateContext.sessionTokenInCookie);
        if (decodedErrors) {
          return handleSessionTokenError(decodedErrors[0], "cookie");
        }
        if (decodeResult.payload.iat < authenticateContext.clientUat) {
          return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SessionTokenIATBeforeClientUAT, "");
        }
        try {
          const { data, errors } = await verifyToken(authenticateContext.sessionTokenInCookie, authenticateContext);
          if (errors) {
            throw errors[0];
          }
          const signedInRequestState = signedIn({
            tokenType: TokenType.SessionToken,
            authenticateContext,
            sessionClaims: data,
            headers: new Headers(),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            token: authenticateContext.sessionTokenInCookie
          });
          const shouldForceHandshakeForCrossDomain = !authenticateContext.isSatellite && // We're on primary
          authenticateContext.secFetchDest === "document" && // Document navigation
          authenticateContext.isCrossOriginReferrer() && // Came from different domain
          !authenticateContext.isKnownClerkReferrer();
          if (shouldForceHandshakeForCrossDomain) {
            return handleMaybeHandshakeStatus(
              authenticateContext,
              AuthErrorReason.PrimaryDomainCrossOriginSync,
              "Cross-origin request from satellite domain requires handshake"
            );
          }
          const authObject = signedInRequestState.toAuth();
          if (authObject.userId) {
            const handshakeRequestState = handleMaybeOrganizationSyncHandshake(authenticateContext, authObject);
            if (handshakeRequestState) {
              return handshakeRequestState;
            }
          }
          return signedInRequestState;
        } catch (err) {
          return handleSessionTokenError(err, "cookie");
        }
        return signedOut({
          tokenType: TokenType.SessionToken,
          authenticateContext,
          reason: AuthErrorReason.UnexpectedError
        });
      }
      __name(authenticateRequestWithTokenInCookie, "authenticateRequestWithTokenInCookie");
      async function handleSessionTokenError(err, tokenCarrier) {
        if (!(err instanceof TokenVerificationError)) {
          return signedOut({
            tokenType: TokenType.SessionToken,
            authenticateContext,
            reason: AuthErrorReason.UnexpectedError
          });
        }
        let refreshError;
        if (isRequestEligibleForRefresh(err, authenticateContext, request)) {
          const { data, error } = await attemptRefresh(authenticateContext);
          if (data) {
            return signedIn({
              tokenType: TokenType.SessionToken,
              authenticateContext,
              sessionClaims: data.jwtPayload,
              headers: data.headers,
              token: data.sessionToken
            });
          }
          if (error?.cause?.reason) {
            refreshError = error.cause.reason;
          } else {
            refreshError = RefreshTokenErrorReason.UnexpectedSDKError;
          }
        } else {
          if (request.method !== "GET") {
            refreshError = RefreshTokenErrorReason.NonEligibleNonGet;
          } else if (!authenticateContext.refreshTokenInCookie) {
            refreshError = RefreshTokenErrorReason.NonEligibleNoCookie;
          } else {
            refreshError = null;
          }
        }
        err.tokenCarrier = tokenCarrier;
        const reasonToHandshake = [
          TokenVerificationErrorReason.TokenExpired,
          TokenVerificationErrorReason.TokenNotActiveYet,
          TokenVerificationErrorReason.TokenIatInTheFuture
        ].includes(err.reason);
        if (reasonToHandshake) {
          return handleMaybeHandshakeStatus(
            authenticateContext,
            convertTokenVerificationErrorReasonToAuthErrorReason({ tokenError: err.reason, refreshError }),
            err.getFullMessage()
          );
        }
        return signedOut({
          tokenType: TokenType.SessionToken,
          authenticateContext,
          reason: err.reason,
          message: err.getFullMessage()
        });
      }
      __name(handleSessionTokenError, "handleSessionTokenError");
      function handleMachineError(tokenType, err) {
        if (!(err instanceof MachineTokenVerificationError)) {
          return signedOut({
            tokenType,
            authenticateContext,
            reason: AuthErrorReason.UnexpectedError
          });
        }
        return signedOut({
          tokenType,
          authenticateContext,
          reason: err.code,
          message: err.getFullMessage()
        });
      }
      __name(handleMachineError, "handleMachineError");
      async function authenticateMachineRequestWithTokenInHeader() {
        const { tokenInHeader } = authenticateContext;
        if (!tokenInHeader) {
          return handleSessionTokenError(new Error("Missing token in header"), "header");
        }
        if (!isMachineTokenByPrefix(tokenInHeader)) {
          return signedOut({
            tokenType: acceptsToken,
            authenticateContext,
            reason: AuthErrorReason.TokenTypeMismatch,
            message: ""
          });
        }
        const parsedTokenType = getMachineTokenType(tokenInHeader);
        const mismatchState = checkTokenTypeMismatch(parsedTokenType, acceptsToken, authenticateContext);
        if (mismatchState) {
          return mismatchState;
        }
        const { data, tokenType, errors } = await verifyMachineAuthToken(tokenInHeader, authenticateContext);
        if (errors) {
          return handleMachineError(tokenType, errors[0]);
        }
        return signedIn({
          tokenType,
          authenticateContext,
          machineData: data,
          token: tokenInHeader
        });
      }
      __name(authenticateMachineRequestWithTokenInHeader, "authenticateMachineRequestWithTokenInHeader");
      async function authenticateAnyRequestWithTokenInHeader() {
        const { tokenInHeader } = authenticateContext;
        if (!tokenInHeader) {
          return handleSessionTokenError(new Error("Missing token in header"), "header");
        }
        if (isMachineTokenByPrefix(tokenInHeader)) {
          const parsedTokenType = getMachineTokenType(tokenInHeader);
          const mismatchState = checkTokenTypeMismatch(parsedTokenType, acceptsToken, authenticateContext);
          if (mismatchState) {
            return mismatchState;
          }
          const { data: data2, tokenType, errors: errors2 } = await verifyMachineAuthToken(tokenInHeader, authenticateContext);
          if (errors2) {
            return handleMachineError(tokenType, errors2[0]);
          }
          return signedIn({
            tokenType,
            authenticateContext,
            machineData: data2,
            token: tokenInHeader
          });
        }
        const { data, errors } = await verifyToken(tokenInHeader, authenticateContext);
        if (errors) {
          return handleSessionTokenError(errors[0], "header");
        }
        return signedIn({
          tokenType: TokenType.SessionToken,
          authenticateContext,
          sessionClaims: data,
          token: tokenInHeader
        });
      }
      __name(authenticateAnyRequestWithTokenInHeader, "authenticateAnyRequestWithTokenInHeader");
      if (Array.isArray(acceptsToken)) {
        if (!isTokenTypeInAcceptedArray(acceptsToken, authenticateContext)) {
          return signedOutInvalidToken();
        }
      }
      if (authenticateContext.tokenInHeader) {
        if (acceptsToken === "any") {
          return authenticateAnyRequestWithTokenInHeader();
        }
        if (acceptsToken === TokenType.SessionToken) {
          return authenticateRequestWithTokenInHeader();
        }
        return authenticateMachineRequestWithTokenInHeader();
      }
      if (acceptsToken === TokenType.OAuthToken || acceptsToken === TokenType.ApiKey || acceptsToken === TokenType.M2MToken) {
        return signedOut({
          tokenType: acceptsToken,
          authenticateContext,
          reason: "No token in header"
        });
      }
      return authenticateRequestWithTokenInCookie();
    }, "authenticateRequest");
    debugRequestState = /* @__PURE__ */ __name((params) => {
      const { isSignedIn, isAuthenticated, proxyUrl, reason, message, publishableKey, isSatellite, domain } = params;
      return { isSignedIn, isAuthenticated, proxyUrl, reason, message, publishableKey, isSatellite, domain };
    }, "debugRequestState");
    convertTokenVerificationErrorReasonToAuthErrorReason = /* @__PURE__ */ __name(({
      tokenError,
      refreshError
    }) => {
      switch (tokenError) {
        case TokenVerificationErrorReason.TokenExpired:
          return `${AuthErrorReason.SessionTokenExpired}-refresh-${refreshError}`;
        case TokenVerificationErrorReason.TokenNotActiveYet:
          return AuthErrorReason.SessionTokenNBF;
        case TokenVerificationErrorReason.TokenIatInTheFuture:
          return AuthErrorReason.SessionTokenIatInTheFuture;
        default:
          return AuthErrorReason.UnexpectedError;
      }
    }, "convertTokenVerificationErrorReasonToAuthErrorReason");
    defaultOptions2 = {
      secretKey: "",
      machineSecretKey: "",
      jwtKey: "",
      apiUrl: void 0,
      apiVersion: void 0,
      proxyUrl: "",
      publishableKey: "",
      isSatellite: false,
      domain: "",
      audience: ""
    };
    __name(createAuthenticateRequest, "createAuthenticateRequest");
  }
});

// ../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-P263NW7Z.mjs
function withLegacyReturn(cb) {
  return async (...args) => {
    const { data, errors } = await cb(...args);
    if (errors) {
      throw errors[0];
    }
    return data;
  };
}
var init_chunk_P263NW7Z = __esm({
  "../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/chunk-P263NW7Z.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    __name(withLegacyReturn, "withLegacyReturn");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-GGFRMWFO.mjs
function snakeToCamel(str) {
  return str ? str.replace(/([-_][a-z])/g, (match3) => match3.toUpperCase().replace(/-|_/, "")) : "";
}
function camelToSnake(str) {
  return str ? str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`) : "";
}
function isTruthy(value) {
  if (typeof value === `boolean`) {
    return value;
  }
  if (value === void 0 || value === null) {
    return false;
  }
  if (typeof value === `string`) {
    if (value.toLowerCase() === `true`) {
      return true;
    }
    if (value.toLowerCase() === `false`) {
      return false;
    }
  }
  const number = parseInt(value, 10);
  if (isNaN(number)) {
    return false;
  }
  if (number > 0) {
    return true;
  }
  return false;
}
var createDeepObjectTransformer, deepCamelToSnake, deepSnakeToCamel;
var init_chunk_GGFRMWFO = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-GGFRMWFO.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    __name(snakeToCamel, "snakeToCamel");
    __name(camelToSnake, "camelToSnake");
    createDeepObjectTransformer = /* @__PURE__ */ __name((transform) => {
      const deepTransform = /* @__PURE__ */ __name((obj) => {
        if (!obj) {
          return obj;
        }
        if (Array.isArray(obj)) {
          return obj.map((el) => {
            if (typeof el === "object" || Array.isArray(el)) {
              return deepTransform(el);
            }
            return el;
          });
        }
        const copy = { ...obj };
        const keys = Object.keys(copy);
        for (const oldName of keys) {
          const newName = transform(oldName.toString());
          if (newName !== oldName) {
            copy[newName] = copy[oldName];
            delete copy[oldName];
          }
          if (typeof copy[newName] === "object") {
            copy[newName] = deepTransform(copy[newName]);
          }
        }
        return copy;
      }, "deepTransform");
      return deepTransform;
    }, "createDeepObjectTransformer");
    deepCamelToSnake = createDeepObjectTransformer(camelToSnake);
    deepSnakeToCamel = createDeepObjectTransformer(snakeToCamel);
    __name(isTruthy, "isTruthy");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-RHZEJGFD.mjs
function isWindowClerkWithMetadata(clerk) {
  return typeof clerk === "object" && clerk !== null && "constructor" in clerk && typeof clerk.constructor === "function";
}
var DEFAULT_CACHE_TTL_MS, _storageKey, _cacheTtl, _TelemetryEventThrottler_instances, generateKey_fn, cache_get, isValidBrowser_get, TelemetryEventThrottler, VALID_LOG_LEVELS, DEFAULT_CONFIG, _config, _eventThrottler, _metadata, _buffer, _pendingFlush, _TelemetryCollector_instances, shouldRecord_fn, shouldRecordLog_fn, shouldBeSampled_fn, scheduleFlush_fn, flush_fn, logEvent_fn, getSDKMetadata_fn, preparePayload_fn, sanitizeContext_fn, TelemetryCollector;
var init_chunk_RHZEJGFD = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/chunk-RHZEJGFD.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_GGFRMWFO();
    init_chunk_IV7BOO4U();
    init_chunk_7ELT755Q();
    DEFAULT_CACHE_TTL_MS = 864e5;
    TelemetryEventThrottler = class {
      static {
        __name(this, "TelemetryEventThrottler");
      }
      constructor() {
        __privateAdd(this, _TelemetryEventThrottler_instances);
        __privateAdd(this, _storageKey, "clerk_telemetry_throttler");
        __privateAdd(this, _cacheTtl, DEFAULT_CACHE_TTL_MS);
      }
      isEventThrottled(payload) {
        if (!__privateGet(this, _TelemetryEventThrottler_instances, isValidBrowser_get)) {
          return false;
        }
        const now = Date.now();
        const key = __privateMethod(this, _TelemetryEventThrottler_instances, generateKey_fn).call(this, payload);
        const entry = __privateGet(this, _TelemetryEventThrottler_instances, cache_get)?.[key];
        if (!entry) {
          const updatedCache = {
            ...__privateGet(this, _TelemetryEventThrottler_instances, cache_get),
            [key]: now
          };
          localStorage.setItem(__privateGet(this, _storageKey), JSON.stringify(updatedCache));
        }
        const shouldInvalidate = entry && now - entry > __privateGet(this, _cacheTtl);
        if (shouldInvalidate) {
          const updatedCache = __privateGet(this, _TelemetryEventThrottler_instances, cache_get);
          delete updatedCache[key];
          localStorage.setItem(__privateGet(this, _storageKey), JSON.stringify(updatedCache));
        }
        return !!entry;
      }
    };
    _storageKey = /* @__PURE__ */ new WeakMap();
    _cacheTtl = /* @__PURE__ */ new WeakMap();
    _TelemetryEventThrottler_instances = /* @__PURE__ */ new WeakSet();
    generateKey_fn = /* @__PURE__ */ __name(function(event) {
      const { sk: _sk, pk: _pk, payload, ...rest } = event;
      const sanitizedEvent = {
        ...payload,
        ...rest
      };
      return JSON.stringify(
        Object.keys({
          ...payload,
          ...rest
        }).sort().map((key) => sanitizedEvent[key])
      );
    }, "generateKey_fn");
    cache_get = /* @__PURE__ */ __name(function() {
      const cacheString = localStorage.getItem(__privateGet(this, _storageKey));
      if (!cacheString) {
        return {};
      }
      return JSON.parse(cacheString);
    }, "cache_get");
    isValidBrowser_get = /* @__PURE__ */ __name(function() {
      if (typeof window === "undefined") {
        return false;
      }
      const storage = window.localStorage;
      if (!storage) {
        return false;
      }
      try {
        const testKey = "test";
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        return true;
      } catch (err) {
        const isQuotaExceededError = err instanceof DOMException && // Check error names for different browsers
        (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED");
        if (isQuotaExceededError && storage.length > 0) {
          storage.removeItem(__privateGet(this, _storageKey));
        }
        return false;
      }
    }, "isValidBrowser_get");
    __name(isWindowClerkWithMetadata, "isWindowClerkWithMetadata");
    VALID_LOG_LEVELS = /* @__PURE__ */ new Set(["error", "warn", "info", "debug", "trace"]);
    DEFAULT_CONFIG = {
      samplingRate: 1,
      maxBufferSize: 5,
      // Production endpoint: https://clerk-telemetry.com
      // Staging endpoint: https://staging.clerk-telemetry.com
      // Local: http://localhost:8787
      endpoint: "https://clerk-telemetry.com"
    };
    TelemetryCollector = class {
      static {
        __name(this, "TelemetryCollector");
      }
      constructor(options) {
        __privateAdd(this, _TelemetryCollector_instances);
        __privateAdd(this, _config);
        __privateAdd(this, _eventThrottler);
        __privateAdd(this, _metadata, {});
        __privateAdd(this, _buffer, []);
        __privateAdd(this, _pendingFlush, null);
        __privateSet(this, _config, {
          maxBufferSize: options.maxBufferSize ?? DEFAULT_CONFIG.maxBufferSize,
          samplingRate: options.samplingRate ?? DEFAULT_CONFIG.samplingRate,
          perEventSampling: options.perEventSampling ?? true,
          disabled: options.disabled ?? false,
          debug: options.debug ?? false,
          endpoint: DEFAULT_CONFIG.endpoint
        });
        if (!options.clerkVersion && typeof window === "undefined") {
          __privateGet(this, _metadata).clerkVersion = "";
        } else {
          __privateGet(this, _metadata).clerkVersion = options.clerkVersion ?? "";
        }
        __privateGet(this, _metadata).sdk = options.sdk;
        __privateGet(this, _metadata).sdkVersion = options.sdkVersion;
        __privateGet(this, _metadata).publishableKey = options.publishableKey ?? "";
        const parsedKey = parsePublishableKey(options.publishableKey);
        if (parsedKey) {
          __privateGet(this, _metadata).instanceType = parsedKey.instanceType;
        }
        if (options.secretKey) {
          __privateGet(this, _metadata).secretKey = options.secretKey.substring(0, 16);
        }
        __privateSet(this, _eventThrottler, new TelemetryEventThrottler());
      }
      get isEnabled() {
        if (__privateGet(this, _metadata).instanceType !== "development") {
          return false;
        }
        if (__privateGet(this, _config).disabled || typeof process !== "undefined" && process.env && isTruthy(process.env.CLERK_TELEMETRY_DISABLED)) {
          return false;
        }
        if (typeof window !== "undefined" && !!window?.navigator?.webdriver) {
          return false;
        }
        return true;
      }
      get isDebug() {
        return __privateGet(this, _config).debug || typeof process !== "undefined" && process.env && isTruthy(process.env.CLERK_TELEMETRY_DEBUG);
      }
      record(event) {
        try {
          const preparedPayload = __privateMethod(this, _TelemetryCollector_instances, preparePayload_fn).call(this, event.event, event.payload);
          __privateMethod(this, _TelemetryCollector_instances, logEvent_fn).call(this, preparedPayload.event, preparedPayload);
          if (!__privateMethod(this, _TelemetryCollector_instances, shouldRecord_fn).call(this, preparedPayload, event.eventSamplingRate)) {
            return;
          }
          __privateGet(this, _buffer).push({ kind: "event", value: preparedPayload });
          __privateMethod(this, _TelemetryCollector_instances, scheduleFlush_fn).call(this);
        } catch (error) {
          console.error("[clerk/telemetry] Error recording telemetry event", error);
        }
      }
      /**
       * Records a telemetry log entry if logging is enabled and not in debug mode.
       *
       * @param entry - The telemetry log entry to record.
       */
      recordLog(entry) {
        try {
          if (!__privateMethod(this, _TelemetryCollector_instances, shouldRecordLog_fn).call(this, entry)) {
            return;
          }
          const levelIsValid = typeof entry?.level === "string" && VALID_LOG_LEVELS.has(entry.level);
          const messageIsValid = typeof entry?.message === "string" && entry.message.trim().length > 0;
          let normalizedTimestamp = null;
          const timestampInput = entry?.timestamp;
          if (typeof timestampInput === "number" || typeof timestampInput === "string") {
            const candidate = new Date(timestampInput);
            if (!Number.isNaN(candidate.getTime())) {
              normalizedTimestamp = candidate;
            }
          }
          if (!levelIsValid || !messageIsValid || normalizedTimestamp === null) {
            if (this.isDebug && typeof console !== "undefined") {
              console.warn("[clerk/telemetry] Dropping invalid telemetry log entry", {
                levelIsValid,
                messageIsValid,
                timestampIsValid: normalizedTimestamp !== null
              });
            }
            return;
          }
          const sdkMetadata = __privateMethod(this, _TelemetryCollector_instances, getSDKMetadata_fn).call(this);
          const logData = {
            sdk: sdkMetadata.name,
            sdkv: sdkMetadata.version,
            cv: __privateGet(this, _metadata).clerkVersion ?? "",
            lvl: entry.level,
            msg: entry.message,
            ts: normalizedTimestamp.toISOString(),
            pk: __privateGet(this, _metadata).publishableKey || null,
            payload: __privateMethod(this, _TelemetryCollector_instances, sanitizeContext_fn).call(this, entry.context)
          };
          __privateGet(this, _buffer).push({ kind: "log", value: logData });
          __privateMethod(this, _TelemetryCollector_instances, scheduleFlush_fn).call(this);
        } catch (error) {
          console.error("[clerk/telemetry] Error recording telemetry log entry", error);
        }
      }
    };
    _config = /* @__PURE__ */ new WeakMap();
    _eventThrottler = /* @__PURE__ */ new WeakMap();
    _metadata = /* @__PURE__ */ new WeakMap();
    _buffer = /* @__PURE__ */ new WeakMap();
    _pendingFlush = /* @__PURE__ */ new WeakMap();
    _TelemetryCollector_instances = /* @__PURE__ */ new WeakSet();
    shouldRecord_fn = /* @__PURE__ */ __name(function(preparedPayload, eventSamplingRate) {
      return this.isEnabled && !this.isDebug && __privateMethod(this, _TelemetryCollector_instances, shouldBeSampled_fn).call(this, preparedPayload, eventSamplingRate);
    }, "shouldRecord_fn");
    shouldRecordLog_fn = /* @__PURE__ */ __name(function(_entry) {
      return true;
    }, "shouldRecordLog_fn");
    shouldBeSampled_fn = /* @__PURE__ */ __name(function(preparedPayload, eventSamplingRate) {
      const randomSeed = Math.random();
      const toBeSampled = randomSeed <= __privateGet(this, _config).samplingRate && (__privateGet(this, _config).perEventSampling === false || typeof eventSamplingRate === "undefined" || randomSeed <= eventSamplingRate);
      if (!toBeSampled) {
        return false;
      }
      return !__privateGet(this, _eventThrottler).isEventThrottled(preparedPayload);
    }, "shouldBeSampled_fn");
    scheduleFlush_fn = /* @__PURE__ */ __name(function() {
      if (typeof window === "undefined") {
        __privateMethod(this, _TelemetryCollector_instances, flush_fn).call(this);
        return;
      }
      const isBufferFull = __privateGet(this, _buffer).length >= __privateGet(this, _config).maxBufferSize;
      if (isBufferFull) {
        if (__privateGet(this, _pendingFlush)) {
          if (typeof cancelIdleCallback !== "undefined") {
            cancelIdleCallback(Number(__privateGet(this, _pendingFlush)));
          } else {
            clearTimeout(Number(__privateGet(this, _pendingFlush)));
          }
        }
        __privateMethod(this, _TelemetryCollector_instances, flush_fn).call(this);
        return;
      }
      if (__privateGet(this, _pendingFlush)) {
        return;
      }
      if ("requestIdleCallback" in window) {
        __privateSet(this, _pendingFlush, requestIdleCallback(() => {
          __privateMethod(this, _TelemetryCollector_instances, flush_fn).call(this);
          __privateSet(this, _pendingFlush, null);
        }));
      } else {
        __privateSet(this, _pendingFlush, setTimeout(() => {
          __privateMethod(this, _TelemetryCollector_instances, flush_fn).call(this);
          __privateSet(this, _pendingFlush, null);
        }, 0));
      }
    }, "scheduleFlush_fn");
    flush_fn = /* @__PURE__ */ __name(function() {
      const itemsToSend = [...__privateGet(this, _buffer)];
      __privateSet(this, _buffer, []);
      __privateSet(this, _pendingFlush, null);
      if (itemsToSend.length === 0) {
        return;
      }
      const eventsToSend = itemsToSend.filter((item) => item.kind === "event").map((item) => item.value);
      const logsToSend = itemsToSend.filter((item) => item.kind === "log").map((item) => item.value);
      if (eventsToSend.length > 0) {
        const eventsUrl = new URL("/v1/event", __privateGet(this, _config).endpoint);
        fetch(eventsUrl, {
          headers: {
            "Content-Type": "application/json"
          },
          keepalive: true,
          method: "POST",
          // TODO: We send an array here with that idea that we can eventually send multiple events.
          body: JSON.stringify({ events: eventsToSend })
        }).catch(() => void 0);
      }
      if (logsToSend.length > 0) {
        const logsUrl = new URL("/v1/logs", __privateGet(this, _config).endpoint);
        fetch(logsUrl, {
          headers: {
            "Content-Type": "application/json"
          },
          keepalive: true,
          method: "POST",
          body: JSON.stringify({ logs: logsToSend })
        }).catch(() => void 0);
      }
    }, "flush_fn");
    logEvent_fn = /* @__PURE__ */ __name(function(event, payload) {
      if (!this.isDebug) {
        return;
      }
      if (typeof console.groupCollapsed !== "undefined") {
        console.groupCollapsed("[clerk/telemetry]", event);
        console.log(payload);
        console.groupEnd();
      } else {
        console.log("[clerk/telemetry]", event, payload);
      }
    }, "logEvent_fn");
    getSDKMetadata_fn = /* @__PURE__ */ __name(function() {
      const sdkMetadata = {
        name: __privateGet(this, _metadata).sdk,
        version: __privateGet(this, _metadata).sdkVersion
      };
      if (typeof window !== "undefined") {
        const windowWithClerk = window;
        if (windowWithClerk.Clerk) {
          const windowClerk = windowWithClerk.Clerk;
          if (isWindowClerkWithMetadata(windowClerk) && windowClerk.constructor.sdkMetadata) {
            const { name, version } = windowClerk.constructor.sdkMetadata;
            if (name !== void 0) {
              sdkMetadata.name = name;
            }
            if (version !== void 0) {
              sdkMetadata.version = version;
            }
          }
        }
      }
      return sdkMetadata;
    }, "getSDKMetadata_fn");
    preparePayload_fn = /* @__PURE__ */ __name(function(event, payload) {
      const sdkMetadata = __privateMethod(this, _TelemetryCollector_instances, getSDKMetadata_fn).call(this);
      return {
        event,
        cv: __privateGet(this, _metadata).clerkVersion ?? "",
        it: __privateGet(this, _metadata).instanceType ?? "",
        sdk: sdkMetadata.name,
        sdkv: sdkMetadata.version,
        ...__privateGet(this, _metadata).publishableKey ? { pk: __privateGet(this, _metadata).publishableKey } : {},
        ...__privateGet(this, _metadata).secretKey ? { sk: __privateGet(this, _metadata).secretKey } : {},
        payload
      };
    }, "preparePayload_fn");
    sanitizeContext_fn = /* @__PURE__ */ __name(function(context) {
      if (context === null || typeof context === "undefined") {
        return null;
      }
      if (typeof context !== "object") {
        return null;
      }
      try {
        const cleaned = JSON.parse(JSON.stringify(context));
        if (cleaned && typeof cleaned === "object" && !Array.isArray(cleaned)) {
          return cleaned;
        }
        return null;
      } catch {
        return null;
      }
    }, "sanitizeContext_fn");
  }
});

// ../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/telemetry.mjs
var init_telemetry = __esm({
  "../node_modules/.pnpm/@clerk+shared@3.25.0_react-_c48584ae75d20ea6b40f1fe2aab7fa94/node_modules/@clerk/shared/dist/telemetry.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_RHZEJGFD();
    init_chunk_GGFRMWFO();
    init_chunk_IV7BOO4U();
    init_chunk_TETGTEI2();
    init_chunk_KOH7GTJO();
    init_chunk_I6MTSTOF();
    init_chunk_7ELT755Q();
  }
});

// ../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/index.mjs
function createClerkClient(options) {
  const opts = { ...options };
  const apiClient = createBackendApiClient(opts);
  const requestState = createAuthenticateRequest({ options: opts, apiClient });
  const telemetry = new TelemetryCollector({
    publishableKey: opts.publishableKey,
    secretKey: opts.secretKey,
    samplingRate: 0.1,
    ...opts.sdkMetadata ? { sdk: opts.sdkMetadata.name, sdkVersion: opts.sdkMetadata.version } : {},
    ...opts.telemetry || {}
  });
  return {
    ...apiClient,
    ...requestState,
    telemetry
  };
}
var verifyToken2;
var init_dist = __esm({
  "../node_modules/.pnpm/@clerk+backend@2.14.0_react_d388cbca555f825c2646675e8bf60369/node_modules/@clerk/backend/dist/index.mjs"() {
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_chunk_EI3YIHOJ();
    init_chunk_LWOXHF4E();
    init_chunk_P263NW7Z();
    init_chunk_XJ4RTXJG();
    init_chunk_YW6OOOXM();
    init_chunk_RPS7XK5K();
    init_telemetry();
    verifyToken2 = withLegacyReturn(verifyToken);
    __name(createClerkClient, "createClerkClient");
  }
});

// api/auth.ts
var createClerk, getSessionToken, authenticateUser, createErrorResponse, createSuccessResponse;
var init_auth = __esm({
  "api/auth.ts"() {
    "use strict";
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_dist();
    createClerk = /* @__PURE__ */ __name((env) => {
      if (!env.CLERK_SECRET_KEY) {
        throw new Error("Missing CLERK_SECRET_KEY environment variable");
      }
      return createClerkClient({
        secretKey: env.CLERK_SECRET_KEY
      });
    }, "createClerk");
    getSessionToken = /* @__PURE__ */ __name((request) => {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader) return null;
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") return null;
      return parts[1];
    }, "getSessionToken");
    authenticateUser = /* @__PURE__ */ __name(async (request, env) => {
      try {
        const token = getSessionToken(request);
        if (!token) {
          return {
            success: false,
            error: {
              message: "Missing authentication token",
              code: "MISSING_AUTH_TOKEN",
              status: 401
            }
          };
        }
        const clerk = createClerk(env);
        const session = await clerk.sessions.verifySessionToken(token);
        if (!session) {
          return {
            success: false,
            error: {
              message: "Invalid or expired session token",
              code: "INVALID_SESSION",
              status: 401
            }
          };
        }
        return {
          success: true,
          userId: session.userId,
          session
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Authentication failed",
            code: "AUTHENTICATION_FAILED",
            status: 401
          }
        };
      }
    }, "authenticateUser");
    createErrorResponse = /* @__PURE__ */ __name((message, status = 500, code) => {
      return new Response(JSON.stringify({
        success: false,
        error: {
          message,
          code,
          status
        }
      }), {
        status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "createErrorResponse");
    createSuccessResponse = /* @__PURE__ */ __name((data, status = 200) => {
      return new Response(JSON.stringify({
        success: true,
        ...data
      }), {
        status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "createSuccessResponse");
  }
});

// api/database.ts
var onRequest;
var init_database = __esm({
  "api/database.ts"() {
    "use strict";
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_auth();
    onRequest = /* @__PURE__ */ __name(async (context) => {
      const { request, env } = context;
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json"
      };
      if (request.method === "OPTIONS") {
        return new Response(null, { headers });
      }
      try {
        const authResult = await authenticateUser(request, env);
        if (!authResult.success) {
          return createErrorResponse(
            authResult.error.message,
            authResult.error.status,
            authResult.error.code
          );
        }
        const requestBody = request.method !== "GET" ? await request.json() : null;
        const url = new URL(request.url);
        const path = url.pathname.replace("/api/database", "");
        const pathParts = path.split("/").filter(Boolean);
        if (request.method === "GET") {
          if (pathParts[0] === "query") {
            const table = pathParts[1];
            const params = Object.fromEntries(url.searchParams);
            let query = `SELECT * FROM ${table}`;
            const values = [];
            if (params.filter) {
              const filters = JSON.parse(params.filter);
              if (filters.length > 0) {
                query += " WHERE ";
                query += filters.map((f, i) => {
                  values.push(f.value);
                  return `${f.column} = ?`;
                }).join(" AND ");
              }
            }
            if (params.orderBy) {
              query += ` ORDER BY ${params.orderBy} ${params.ascending === "true" ? "ASC" : "DESC"}`;
            }
            if (params.limit) {
              query += ` LIMIT ${parseInt(params.limit, 10)}`;
              if (params.offset) {
                query += ` OFFSET ${parseInt(params.offset, 10)}`;
              }
            }
            const stmt = env.DB.prepare(query);
            const result = values.length > 0 ? await stmt.bind(...values).all() : await stmt.all();
            return createSuccessResponse({ data: result.results });
          }
        } else if (request.method === "POST") {
          if (pathParts[0] === "insert") {
            const table = pathParts[1];
            const data = requestBody.data;
            const columns = Object.keys(data);
            const placeholders = columns.map(() => "?").join(", ");
            const values = columns.map((col) => data[col]);
            const query = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`;
            const stmt = env.DB.prepare(query);
            const result = await stmt.bind(...values).all();
            return createSuccessResponse({ data: result.results[0] });
          } else if (pathParts[0] === "sql") {
            const { sql, params } = requestBody;
            const stmt = env.DB.prepare(sql);
            const result = params ? await stmt.bind(...params).all() : await stmt.all();
            return createSuccessResponse({ data: result.results });
          }
        } else if (request.method === "PUT") {
          if (pathParts[0] === "update") {
            const table = pathParts[1];
            const { data, filter } = requestBody;
            const setColumns = Object.keys(data).map((col) => `${col} = ?`).join(", ");
            const setValues = Object.values(data);
            let whereClause = "";
            let whereValues = [];
            if (filter) {
              whereClause = " WHERE " + filter.map((f) => `${f.column} = ?`).join(" AND ");
              whereValues = filter.map((f) => f.value);
            }
            const query = `UPDATE ${table} SET ${setColumns}${whereClause} RETURNING *`;
            const stmt = env.DB.prepare(query);
            const result = await stmt.bind(...[...setValues, ...whereValues]).all();
            return createSuccessResponse({ data: result.results[0] });
          }
        } else if (request.method === "DELETE") {
          if (pathParts[0] === "delete") {
            const table = pathParts[1];
            const filter = requestBody.filter;
            let whereClause = "";
            let whereValues = [];
            if (filter) {
              whereClause = " WHERE " + filter.map((f) => `${f.column} = ?`).join(" AND ");
              whereValues = filter.map((f) => f.value);
            }
            const query = `DELETE FROM ${table}${whereClause} RETURNING *`;
            const stmt = env.DB.prepare(query);
            const result = whereValues.length > 0 ? await stmt.bind(...whereValues).all() : await stmt.all();
            return createSuccessResponse({ data: result.results });
          }
        }
        return createErrorResponse(
          "Invalid operation",
          400,
          "INVALID_OPERATION"
        );
      } catch (error) {
        console.error("Database API error:", error);
        return createErrorResponse(
          error instanceof Error ? error.message : "Internal server error",
          500,
          "INTERNAL_ERROR"
        );
      }
    }, "onRequest");
  }
});

// api/r2.ts
var onRequest2;
var init_r2 = __esm({
  "api/r2.ts"() {
    "use strict";
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    onRequest2 = /* @__PURE__ */ __name(async (context) => {
      const { request, env } = context;
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      };
      if (request.method === "OPTIONS") {
        return new Response(null, { headers });
      }
      try {
        const url = new URL(request.url);
        const path = url.pathname.replace("/api/r2", "").replace(/^\/+/, "");
        if (request.method === "GET") {
          if (path === "list") {
            const prefix = url.searchParams.get("prefix") || "";
            const delimiter = url.searchParams.get("delimiter") || "/";
            const limit = parseInt(url.searchParams.get("limit") || "1000", 10);
            const listed = await env.STORAGE.list({
              prefix,
              delimiter,
              limit
            });
            const files = listed.objects.map((object) => ({
              key: object.key,
              size: object.size,
              etag: object.etag,
              lastModified: object.uploaded
            }));
            return new Response(JSON.stringify({
              files,
              prefixes: listed.delimitedPrefixes
            }), {
              headers: { ...headers, "Content-Type": "application/json" }
            });
          } else if (path === "details") {
            const key = url.searchParams.get("key");
            if (!key) {
              return new Response(JSON.stringify({ error: "Missing file key" }), {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" }
              });
            }
            const object = await env.STORAGE.head(key);
            if (object === null) {
              return new Response(JSON.stringify({ error: "File not found" }), {
                status: 404,
                headers: { ...headers, "Content-Type": "application/json" }
              });
            }
            const publicUrl = `${url.origin}/r2/${key}`;
            return new Response(JSON.stringify({
              key,
              url: publicUrl,
              size: object.size,
              etag: object.etag,
              lastModified: object.uploaded,
              contentType: object.httpMetadata.contentType,
              metadata: object.customMetadata
            }), {
              headers: { ...headers, "Content-Type": "application/json" }
            });
          } else {
            const key = path;
            const object = await env.STORAGE.get(key);
            if (object === null) {
              return new Response("File not found", { status: 404, headers });
            }
            const fileHeaders = new Headers(headers);
            fileHeaders.set("Content-Type", object.httpMetadata.contentType || "application/octet-stream");
            fileHeaders.set("Content-Length", object.size.toString());
            fileHeaders.set("ETag", object.etag);
            if (object.httpMetadata.cacheControl) {
              fileHeaders.set("Cache-Control", object.httpMetadata.cacheControl);
            } else {
              fileHeaders.set("Cache-Control", "public, max-age=31536000");
            }
            return new Response(object.body, {
              headers: fileHeaders
            });
          }
        } else if (request.method === "POST" || request.method === "PUT") {
          if (path === "upload") {
            let key;
            let contentType;
            let metadata = {};
            let file;
            const contentTypeHeader = request.headers.get("Content-Type") || "";
            if (contentTypeHeader.includes("multipart/form-data")) {
              const formData = await request.formData();
              file = formData.get("file");
              key = formData.get("key") || file.name;
              contentType = file.type;
              const metadataField = formData.get("metadata");
              if (metadataField) {
                try {
                  metadata = JSON.parse(metadataField);
                } catch (e) {
                  console.error("Invalid metadata JSON:", e);
                }
              }
            } else {
              const requestBody = await request.json();
              key = requestBody.key;
              if (!key || !requestBody.base64Content) {
                return new Response(JSON.stringify({ error: "Missing key or file content" }), {
                  status: 400,
                  headers: { ...headers, "Content-Type": "application/json" }
                });
              }
              const binaryContent = atob(requestBody.base64Content);
              const bytes = new Uint8Array(binaryContent.length);
              for (let i = 0; i < binaryContent.length; i++) {
                bytes[i] = binaryContent.charCodeAt(i);
              }
              file = new Blob([bytes], { type: requestBody.contentType || "application/octet-stream" });
              contentType = requestBody.contentType;
              metadata = requestBody.metadata || {};
            }
            if (!key) {
              return new Response(JSON.stringify({ error: "Missing file key" }), {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" }
              });
            }
            const uploadOptions = {
              httpMetadata: {
                contentType
              },
              customMetadata: metadata
            };
            await env.STORAGE.put(key, file, uploadOptions);
            const publicUrl = `${url.origin}/r2/${key}`;
            return new Response(JSON.stringify({
              key,
              url: publicUrl,
              size: file.size,
              lastModified: (/* @__PURE__ */ new Date()).toISOString(),
              contentType,
              metadata
            }), {
              headers: { ...headers, "Content-Type": "application/json" }
            });
          }
        } else if (request.method === "DELETE") {
          const requestBody = await request.json();
          const key = requestBody.key;
          if (!key) {
            return new Response(JSON.stringify({ error: "Missing file key" }), {
              status: 400,
              headers: { ...headers, "Content-Type": "application/json" }
            });
          }
          await env.STORAGE.delete(key);
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...headers, "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({ error: "Invalid operation" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("R2 API error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...headers, "Content-Type": "application/json" }
        });
      }
    }, "onRequest");
  }
});

// api/submissions.ts
var onRequest3, isAdminUser;
var init_submissions = __esm({
  "api/submissions.ts"() {
    "use strict";
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_auth();
    onRequest3 = /* @__PURE__ */ __name(async (context) => {
      const { request, env } = context;
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      };
      if (request.method === "OPTIONS") {
        return new Response(null, { headers });
      }
      try {
        const url = new URL(request.url);
        const path = url.pathname.replace("/api/submissions", "");
        if (path === "/" && request.method === "POST") {
          const authResult = await authenticateUser(request, env);
          if (!authResult.success) {
            return createErrorResponse(
              authResult.error.message,
              authResult.error.status,
              authResult.error.code
            );
          }
          try {
            const body = await request.json();
            const submissionData = body.submission || body;
            if (!submissionData.id || !submissionData.userId) {
              return createErrorResponse(
                "Missing required fields: id and userId",
                400,
                "MISSING_FIELDS"
              );
            }
            if (submissionData.userId !== authResult.userId) {
              return createErrorResponse(
                "You can only create submissions for yourself",
                403,
                "INSUFFICIENT_PERMISSIONS"
              );
            }
            const result = await env.DB.prepare(`
          INSERT INTO document_submissions (
            id, user_id, order_id, customer_name, customer_email,
            service_type, subject_area, word_count, study_level, due_date,
            module, instructions, price, files, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
              submissionData.id,
              submissionData.userId,
              submissionData.metadata?.orderId || "",
              submissionData.metadata?.clientName || "",
              submissionData.metadata?.clientEmail || "",
              submissionData.metadata?.serviceType || "",
              submissionData.metadata?.subjectArea || "",
              submissionData.metadata?.wordCount || 0,
              submissionData.metadata?.studyLevel || "",
              submissionData.metadata?.dueDate || "",
              submissionData.metadata?.module || "",
              submissionData.metadata?.instructions || "",
              submissionData.metadata?.price || 0,
              JSON.stringify(submissionData.files || []),
              submissionData.status || "submitted",
              (/* @__PURE__ */ new Date()).toISOString()
            ).run();
            if (result.success) {
              return createSuccessResponse({
                submissionId: submissionData.id,
                message: "Submission created successfully"
              }, 201);
            } else {
              return createErrorResponse(
                "Failed to save submission to database",
                500,
                "DATABASE_ERROR"
              );
            }
          } catch (error) {
            if (error instanceof SyntaxError) {
              return createErrorResponse(
                "Invalid JSON in request body",
                400,
                "INVALID_JSON"
              );
            }
            throw error;
          }
        }
        if (path.includes("/status") && request.method === "PUT") {
          const authResult = await authenticateUser(request, env);
          if (!authResult.success) {
            return createErrorResponse(
              authResult.error.message,
              authResult.error.status,
              authResult.error.code
            );
          }
          try {
            const pathParts = path.split("/");
            const submissionId = pathParts[pathParts.length - 2];
            if (!submissionId) {
              return createErrorResponse(
                "Missing submission ID",
                400,
                "MISSING_ID"
              );
            }
            const submission = await env.DB.prepare(`
          SELECT user_id FROM document_submissions WHERE id = ?
        `).bind(submissionId).first();
            if (!submission) {
              return createErrorResponse(
                "Submission not found",
                404,
                "NOT_FOUND"
              );
            }
            if (submission.user_id !== authResult.userId) {
              const adminCheck = await isAdminUser(authResult.userId, env);
              if (!adminCheck.success || !adminCheck.isAdmin) {
                return createErrorResponse(
                  "You do not have permission to update this submission",
                  403,
                  "INSUFFICIENT_PERMISSIONS"
                );
              }
            }
            const body = await request.json();
            const { status } = body;
            if (!status) {
              return createErrorResponse(
                "Missing status field",
                400,
                "MISSING_STATUS"
              );
            }
            const result = await env.DB.prepare(`
          UPDATE document_submissions SET status = ?, updated_at = ? WHERE id = ?
        `).bind(status, (/* @__PURE__ */ new Date()).toISOString(), submissionId).run();
            if (result.success) {
              return createSuccessResponse({
                submissionId,
                message: "Submission status updated successfully"
              });
            } else {
              return createErrorResponse(
                "Failed to update submission status",
                500,
                "DATABASE_ERROR"
              );
            }
          } catch (error) {
            if (error instanceof SyntaxError) {
              return createErrorResponse(
                "Invalid JSON in request body",
                400,
                "INVALID_JSON"
              );
            }
            throw error;
          }
        }
        if (path.startsWith("/") && request.method === "GET") {
          const authResult = await authenticateUser(request, env);
          if (!authResult.success) {
            return createErrorResponse(
              authResult.error.message,
              authResult.error.status,
              authResult.error.code
            );
          }
          const submissionId = path.substring(1);
          if (!submissionId) {
            return createErrorResponse(
              "Missing submission ID",
              400,
              "MISSING_ID"
            );
          }
          if (submissionId.startsWith("user/")) {
            const userId = submissionId.replace("user/", "");
            if (!userId) {
              return createErrorResponse(
                "Missing user ID",
                400,
                "MISSING_USER_ID"
              );
            }
            if (userId !== authResult.userId) {
              const adminCheck = await isAdminUser(authResult.userId, env);
              if (!adminCheck.success || !adminCheck.isAdmin) {
                return createErrorResponse(
                  "You do not have permission to view these submissions",
                  403,
                  "INSUFFICIENT_PERMISSIONS"
                );
              }
            }
            const results = await env.DB.prepare(`
          SELECT * FROM document_submissions WHERE user_id = ? ORDER BY created_at DESC
        `).bind(userId).all();
            return createSuccessResponse({
              submissions: results.results || []
            });
          } else {
            const result = await env.DB.prepare(`
          SELECT * FROM document_submissions WHERE id = ?
        `).bind(submissionId).first();
            if (!result) {
              return createErrorResponse(
                "Submission not found",
                404,
                "NOT_FOUND"
              );
            }
            if (result.user_id !== authResult.userId) {
              const adminCheck = await isAdminUser(authResult.userId, env);
              if (!adminCheck.success || !adminCheck.isAdmin) {
                return createErrorResponse(
                  "You do not have permission to view this submission",
                  403,
                  "INSUFFICIENT_PERMISSIONS"
                );
              }
            }
            if (result) {
              return createSuccessResponse(result);
            } else {
              return createErrorResponse(
                "Submission not found",
                404,
                "NOT_FOUND"
              );
            }
          }
        }
        return createErrorResponse(
          "Endpoint not found",
          404,
          "NOT_FOUND"
        );
      } catch (error) {
        console.error("Submissions API error:", error);
        return createErrorResponse(
          error instanceof Error ? error.message : "Internal server error",
          500,
          "INTERNAL_ERROR"
        );
      }
    }, "onRequest");
    isAdminUser = /* @__PURE__ */ __name(async (userId, env) => {
      try {
        return {
          success: true,
          isAdmin: false
          // Default to false for now
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Failed to check admin status",
            code: "ADMIN_CHECK_FAILED",
            status: 500
          }
        };
      }
    }, "isAdminUser");
  }
});

// api/test.ts
var onRequest4;
var init_test = __esm({
  "api/test.ts"() {
    "use strict";
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_auth();
    onRequest4 = /* @__PURE__ */ __name(async (context) => {
      const { request } = context;
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      };
      if (request.method === "OPTIONS") {
        return new Response(null, { headers });
      }
      try {
        if (request.method === "GET") {
          return createSuccessResponse({
            message: "API test endpoint is working",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        return createErrorResponse(
          "Method not allowed",
          405,
          "METHOD_NOT_ALLOWED"
        );
      } catch (error) {
        console.error("Test API error:", error);
        return createErrorResponse(
          error instanceof Error ? error.message : "Internal server error",
          500,
          "INTERNAL_ERROR"
        );
      }
    }, "onRequest");
  }
});

// api/upload.ts
var onRequest5, isAdminUser2;
var init_upload = __esm({
  "api/upload.ts"() {
    "use strict";
    init_functionsRoutes_0_006413031454188811();
    init_checked_fetch();
    init_auth();
    onRequest5 = /* @__PURE__ */ __name(async (context) => {
      const { request, env } = context;
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      };
      if (request.method === "OPTIONS") {
        return new Response(null, { headers });
      }
      try {
        const url = new URL(request.url);
        const path = url.pathname.replace("/api/upload", "");
        if (path === "/presigned-url" && request.method === "POST") {
          const authResult = await authenticateUser(request, env);
          if (!authResult.success) {
            return createErrorResponse(
              authResult.error.message,
              authResult.error.status,
              authResult.error.code
            );
          }
          const body = await request.json();
          const { key, contentType } = body;
          const uploadUrl = `${url.origin}/api/upload/direct/${key}`;
          return createSuccessResponse({
            uploadUrl,
            key,
            success: true
          });
        }
        if (path === "/" && request.method === "POST") {
          const authResult = await authenticateUser(request, env);
          if (!authResult.success) {
            return createErrorResponse(
              authResult.error.message,
              authResult.error.status,
              authResult.error.code
            );
          }
          const formData = await request.formData();
          const file = formData.get("file");
          const key = formData.get("key");
          if (!file || !key) {
            return createErrorResponse(
              "Missing file or key",
              400,
              "MISSING_FILE_OR_KEY"
            );
          }
          const maxSize = 50 * 1024 * 1024;
          if (file.size > maxSize) {
            return createErrorResponse(
              "File size exceeds 50MB limit",
              400,
              "FILE_TOO_LARGE"
            );
          }
          const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "text/markdown",
            "text/csv",
            "application/rtf",
            "application/zip",
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/svg+xml",
            "image/webp"
          ];
          const allowedExtensions = [
            ".pdf",
            ".doc",
            ".docx",
            ".txt",
            ".md",
            ".rtf",
            ".csv",
            ".xls",
            ".xlsx",
            ".ppt",
            ".pptx",
            ".zip",
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".svg",
            ".webp"
          ];
          const isMimeTypeAllowed = allowedTypes.includes(file.type);
          const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
          const isExtensionAllowed = allowedExtensions.includes(fileExtension);
          if (!isMimeTypeAllowed || !isExtensionAllowed) {
            return createErrorResponse(
              `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
              400,
              "INVALID_FILE_TYPE"
            );
          }
          await env.STORAGE.put(key, file.stream(), {
            httpMetadata: {
              contentType: file.type,
              contentDisposition: `attachment; filename="${file.name}"`
            },
            customMetadata: {
              originalName: file.name,
              uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
              fileSize: file.size.toString(),
              fileExtension,
              userId: authResult.userId
            }
          });
          return createSuccessResponse({
            success: true,
            key,
            url: `https://cdn.handywriterz.com/${key}`,
            size: file.size,
            type: file.type,
            name: file.name
          });
        }
        if (path.startsWith("/") && request.method === "DELETE") {
          const authResult = await authenticateUser(request, env);
          if (!authResult.success) {
            return createErrorResponse(
              authResult.error.message,
              authResult.error.status,
              authResult.error.code
            );
          }
          const key = path.substring(1);
          const object = await env.STORAGE.head(key);
          if (object && object.customMetadata?.userId !== authResult.userId) {
            const adminCheck = await isAdminUser2(authResult.userId, env);
            if (!adminCheck.success || !adminCheck.isAdmin) {
              return createErrorResponse(
                "You do not have permission to delete this file",
                403,
                "INSUFFICIENT_PERMISSIONS"
              );
            }
          }
          await env.STORAGE.delete(key);
          return createSuccessResponse({
            success: true
          });
        }
        if (path.startsWith("/info/") && request.method === "GET") {
          const authResult = await authenticateUser(request, env);
          if (!authResult.success) {
            return createErrorResponse(
              authResult.error.message,
              authResult.error.status,
              authResult.error.code
            );
          }
          const key = path.replace("/info/", "");
          const object = await env.STORAGE.head(key);
          if (!object) {
            return createErrorResponse(
              "File not found",
              404,
              "FILE_NOT_FOUND"
            );
          }
          if (object.customMetadata?.userId !== authResult.userId) {
            const adminCheck = await isAdminUser2(authResult.userId, env);
            if (!adminCheck.success || !adminCheck.isAdmin) {
              return createErrorResponse(
                "You do not have permission to access this file",
                403,
                "INSUFFICIENT_PERMISSIONS"
              );
            }
          }
          return createSuccessResponse({
            exists: true,
            size: object.size,
            lastModified: object.uploaded.toISOString(),
            contentType: object.httpMetadata?.contentType,
            customMetadata: object.customMetadata
          });
        }
        return createErrorResponse(
          "Endpoint not found",
          404,
          "ENDPOINT_NOT_FOUND"
        );
      } catch (error) {
        console.error("Upload API error:", error);
        return createErrorResponse(
          error instanceof Error ? error.message : "Internal server error",
          500,
          "INTERNAL_ERROR"
        );
      }
    }, "onRequest");
    isAdminUser2 = /* @__PURE__ */ __name(async (userId, env) => {
      try {
        return {
          success: true,
          isAdmin: false
          // Default to false for now
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Failed to check admin status",
            code: "ADMIN_CHECK_FAILED",
            status: 500
          }
        };
      }
    }, "isAdminUser");
  }
});

// ../.wrangler/tmp/pages-CWjmo2/functionsRoutes-0.006413031454188811.mjs
var routes;
var init_functionsRoutes_0_006413031454188811 = __esm({
  "../.wrangler/tmp/pages-CWjmo2/functionsRoutes-0.006413031454188811.mjs"() {
    "use strict";
    init_database();
    init_r2();
    init_submissions();
    init_test();
    init_upload();
    routes = [
      {
        routePath: "/api/database",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/api/r2",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/submissions",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/api/test",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest4]
      },
      {
        routePath: "/api/upload",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest5]
      }
    ];
  }
});

// ../.wrangler/tmp/bundle-xLLS1Y/middleware-loader.entry.ts
init_functionsRoutes_0_006413031454188811();
init_checked_fetch();

// ../.wrangler/tmp/bundle-xLLS1Y/middleware-insertion-facade.js
init_functionsRoutes_0_006413031454188811();
init_checked_fetch();

// ../node_modules/.pnpm/wrangler@4.36.0_@cloudflare_d4bacab0623f00310a98325b6a6e981f/node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_006413031454188811();
init_checked_fetch();

// ../node_modules/.pnpm/path-to-regexp@6.3.0/node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_006413031454188811();
init_checked_fetch();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse3(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse3, "parse");
function match2(str, options) {
  var keys = [];
  var re = pathToRegexp2(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match2, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp2(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse3(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp2(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp2, "pathToRegexp");

// ../node_modules/.pnpm/wrangler@4.36.0_@cloudflare_d4bacab0623f00310a98325b6a6e981f/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match2(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match2(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match2(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match2(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/.pnpm/wrangler@4.36.0_@cloudflare_d4bacab0623f00310a98325b6a6e981f/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_functionsRoutes_0_006413031454188811();
init_checked_fetch();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/.pnpm/wrangler@4.36.0_@cloudflare_d4bacab0623f00310a98325b6a6e981f/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_functionsRoutes_0_006413031454188811();
init_checked_fetch();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-xLLS1Y/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/.pnpm/wrangler@4.36.0_@cloudflare_d4bacab0623f00310a98325b6a6e981f/node_modules/wrangler/templates/middleware/common.ts
init_functionsRoutes_0_006413031454188811();
init_checked_fetch();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-xLLS1Y/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.00432784623102056.mjs.map
