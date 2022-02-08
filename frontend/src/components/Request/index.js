/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";

function Request(props) {
  let { message, url, method, data, headers, onSuccess, onFailure } =
    props || {};
  const [isUnBlocking, setBlocking] = useState(false);
  const controller = new AbortController();
  const makeRequest = () => {
    // eslint-disable-next-line no-new-wrappers
    url = new String(url);
    let standardURL = null;
    try {
      standardURL = new URL(url);
    } catch (e) {
      let { protocol, host, href } = window.location;
      if (url.charAt(0) == "/") {
        standardURL = new URL(protocol + "//" + host + url);
      } else if (href.charAt(href.length - 1) == "/") {
        standardURL = new URL(href + url);
      } else {
        standardURL = new URL(href + "/" + url);
      }
    }
    let bodyAlone = null;

    if (["head", "get"].indexOf(method.toLowerCase()) > 0) {
      Object.keys(data).forEach((key) => {
        let paramValue = data[key];
        return standardURL.searchParams.append(
          key,
          typeof paramValue != "string"
            ? JSON.stringify(paramValue)
            : paramValue
        );
      });
    } else {
      bodyAlone = { body: JSON.stringify(data) };
    }

    fetch(standardURL, {
      signal: controller.signal,
      method: method,
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: headers || {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrer: "no-referrer",
      ...bodyAlone,
    })
      .then((response) => response.json())
      .then((response) => {
        if (typeof onSuccess == "function") {
          onSuccess(response);
        }
      })
      .catch((error) => {
        if (typeof onFailure == "function") {
          onFailure(error);
        }
      });
  };
  useEffect(() => {
    makeRequest();
    return () => {
      //Cancel Request
      if (!!controller && typeof controller.abort == "function") {
        controller.abort();
      }
    };
  });
  return (
    <div
      className="blockUi"
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      <div
        className={`loader-bg ${isUnBlocking ? " req-is-blocking" : ""}`}
        data-text={message || "Loading"}
      >
        <div className="loader-track">
          <div className="loader-fill"></div>
        </div>
      </div>
    </div>
  );
}

export default Request;
