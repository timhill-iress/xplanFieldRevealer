---
layout: default
---

The Xplan Field Revealer adds fields information to Xplan edit screens.

## It transforms this

![before](./before.png "Before")

## Into this

![after](./after.png "After")

## Setup instructions for user

[Bookmarklet instructions](./bookmarklet.html) for users that just want to find field names. The JavaScript code will only run when you click on the bookmarklet.

## Setup instructions  for developers that may wish to contribute to improving this project

[Tampermonkey instructions](./TamperMonkey.html) provides a mechanism to update and improve the JavaScript code.

Both options allow for auto-updating. I feel this is the best option for most users, although I'm considering a bookmarklet that doesn't update for users that would rather know what code is being run in their browser.

## How does it work?

The XplanFieldRevealer inspects clues in the html to determine the Xplan internal field-name, and the Xplan group name. Specifically, it looks at the names of input controls for clues on the field names, and at hidden inputs and form attributes for group name information.

## Does it work on all Xplan screens?

No, there are only limited Xplan screens where it works.

1. It must be an Edit screen.
2. It must not be a pop-up dialog.
3. It only works on entity and list based screens, in the simplest terms, if a screen is based on fields that you see in Field Definitions it will probably work. This includes screens such as:
    * client data screens,
    * asset data screens,
    * liability data screens,
    * insurance data screens,
    * pension data screens,
    * custom screens
4. It will specifically, not work on portfolio screens, or workflow screens (threads, tasks, cases, leads etc).

Based on my experience, the screens it works on are the ones where people most often struggle to determine field names.

## How to use the bookmarklet version

When on an Xplan edit screen, click the bookmarklet that you installed. The bookmarklet will looks for clues in the html and display the information below each field where it can determine field information.

## How to use the TamperMonkey version

By default the script will run on all Xplan screens for all Xplan sites matching the domain ***.xplan.iress.co.uk**. If your Xplan site is in another region or has a vanity/custom domain then you will need to change the TamperMonkey options to make it work for your site.
