# Tutorial

Lets build a simple app to get familiar with superglue.

<!-- panels:start -->

<!-- div:title-panel -->

## Hello world

#### 1. Start with the usual
<!-- div:left-panel -->
Add a route and a controller to an app that followed the installation steps.

!> The installation steps will include a layout `application.json.props` that's
**implicitly used** in this tutorial.


<!-- div:right-panel -->

<!-- tabs:start -->

#### **`routes.rb`**

```ruby
# app/config/routes.rb

resource :greet, only: :show
```

#### **`greet_controller.rb`**

```ruby
# app/controllers/greet_controller.rb

class GreetController < ApplicationController
  def show
  end
end
```

<!-- tabs:end -->





<!-- div:left-panel -->
#### 2. Add the views

Next lets add the following views. Here we're splitting the usual `show.html.erb` into 3 parts:
- `app/views/greet/show.json.props`
- `app/views/greet/show.js`
- `app/views/greet/show.html.erb`


<!-- div:right-panel -->

<!-- tabs:start -->
#### **`show.json.props`**

If you've used Jbuidler, this should look familiar. Here, we're using
[props_template], a Jbuilder inspired templating DSL built for superglue.

  [props_template]: https://github.com/thoughtbot/props_template

```ruby
json.body
  json.greet "Hello world"
end

json.footer "Made with hearts"
```

?> Shape the page to how you would visually organize your components. Superglue
encourages you to shape `json` responses to include both data AND presentation.


#### **`show.js`**

The result of `show.json.props` will be passed to your page component.

```js
import React from 'react'

export default function GreetShow({
  body,
  footer
}) {
  const {greet} = body

  return (
    <h1>{greet}</h1>
    <span>{footer}</span>
  )
}
```

#### **`show.html.erb`**

?> This file is usually generated by a scaffold and stays exactly the same
regardless if its `index.html.erb`, `show.html.erb`, `edit.html.erb`, etc.

This file renders and injects `show.json.props` sets it globally as the initial
state to be picked up by React and Redux.

```ruby
<% initial_state = controller.render_to_string(formats: [:json], locals: local_assigns, layout: true) %>

<script type="text/javascript">
  window.SUPERGLUE_INITIAL_PAGE_STATE=<%= initial_state.html_safe %>;<%# erblint:disable ErbSafety %>
</script>

<div id="app"></div>

```

<!-- tabs:end -->


<!-- div:left-panel -->

#### 3. Connect the dots

The json [payload] that gets rendered into `show.html.erb` also contains information about
the template it rendered from the `componentIdentifier`.

  [payload]: page-response.md

?> If you do not knowing what the `componentIdentifier` of a page is, you can
go to the `json` version of the page on your browser to see what gets rendered. In our case:
http://localhost:3000/greet.json

We're going to use the `componentIdentifier` to tie `show.json.props` to `show.js` so
superglue knows which component to render with which response by modifying
`app/javascript/page_to_page_mapping.js`.

<!-- div:right-panel -->

<!-- tabs:start -->
#### **Example greet.json**
The layout for `show.json.props` is located at `app/views/layouts/application.json.props`. It
conforms to superglue's [payload] response, and uses the `active_template_virtual_path` as the
`componentIdentifier`.

```json
{
  data: {
    body: {
      greet: "Hello world"
    }
    footer: "Made with hearts"
  },
  componentIdentifier: "greet/show",
  ...
}
```

#### **`page_to_page_mapping.js`**

```js
import GreetShow from '../views/greet/show'

export const pageIdentifierToPageComponent = {
  'greet/show': GreetShow,
};

```

<!-- tabs:end -->
<!-- panels:end -->

#### 4. Finish

Run a rails server and go to http://localhost:3000/greet.


## Productivity

That was quite an amount of steps to get to a Hello World. For simple
functionality it's not immediately obvious where Superglue fits, but for medium
complexity and beyond, Superglue shines where it can be clunky for tools like
Turbo, Hotwire and friends.

Let's add some complexity to the previous sample.

<!-- panels:start -->

<!-- div:title-panel -->


### Digging for content

<!-- div:left-panel -->
But first! A quick dive into [props_template]. Click on the tabs to see what happens
when `@path` changes for the example below.

```ruby
json.data(@path) do
  json.body do
    json.chart do
      sleep 10
      json.header "Sales"
    end

    json.user do
      json.name "John"
    end
  end

  json.footer do
    json.year "2003"
  end
end

json.componentIdentifier "someId"
```

<!-- div:right-panel -->

<!-- tabs:start -->

#### **data**

When `@path = ['data']`. There's a 10 second sleep, and the output will be:

```json
{
  data: {
    body: {
      chart: {
        header: "Sales"
      },
      user: {
        name: "John"
      }
    },
    footer: {
      year: "2003"
    }
  },
  componentIdentifier: "someId"
}

```

#### **data.body**

When `@path = ['data', 'body']`. There's a 10 second sleep, and the output will be:

```json
{
  data: {
    chart: {
      header: "Sales"
    },
    user: {
      name: "John"
    }
  },
  componentIdentifier: "someId"
}

```

#### **data.body.user**

When `@path = ['data', 'body', 'user']`, there is no wait, and the `json` will be:

```json
{
  data: {
    name: "john"
  },
  componentIdentifier: "someId"
}

```

#### **data.footer**

When `@path = ['data', 'year']`, there is no wait, and the `json` will be:

```json
{
  data: {
    year: "2003"
  },
  componentIdentifier: "someId"
}

```


<!-- tabs:end -->
<!-- panels:end -->



<!-- panels:start -->


<!-- div:left-panel -->
#### 5. Continuing where we last left off

Lets add a 5 second sleep to `show.json.props` so ever user is waiting 5
seconds for every page load.

How should we improve the user experience?

<!-- div:right-panel -->

<!-- tabs:start -->
#### **`show.json.props`**

```ruby
json.body
  sleep 5
  json.greet "Hello world"
end

json.footer "Made with hearts"
```

<!-- tabs:end -->


<!-- div:left-panel -->

#### 6. Load the content later

What if we add a link on the page that would load the greeting async? Sounds
like a good start, lets do that.  We'll use `defer: :manual` to tell
props_template to skip over the block.



<!-- div:right-panel -->

<!-- tabs:start -->
#### **`show.json.props`**

```ruby
json.body(defer: :manual)
  sleep 5
  json.greet "Hello world"
end

json.footer "Made with hearts"
```

#### **output**

Adding `defer: :manual` will replace the contents with an empty object.

```json
{
  data: {
    body: {},
    footer: "Made with hearts"
  },
  componentIdentifier: "greet/show",
  ...
}
```

#### **`show.js`**

We'll also have to handle the case when there is no greeting.

?> We'll improve on this approach. The `defer` option can specify a fallback.

```js
import React from 'react'

export default function GreetShow({
  body,
  footer,
  loadGreetPath
}) {
  const {greet} = body

  return (
    <h1>{greet || "Waiting for greet"}</h1>
    <a href={loadGreetPath} data-sg-remote>Load Greet</a>
    <span>{footer}</span>
  )
}
```

<!-- tabs:end -->


<!-- div:left-panel -->

#### 7. Add a link

Now when the user lands on the page, we're no longer waiting 5 seconds. Lets
add a link that will dig for the missing content to replace "Waiting for greet".

<!-- div:right-panel -->

<!-- tabs:start -->
#### **`show.json.props`**

Add url for the `href` link with `props_at` param. This is used on the
`application.json.props` layout that instructs props_template to dig.

```ruby
json.body(defer: :manual)
  sleep 5
  json.greet "Hello world"
end

json.loadGreetPath greet_path(props_at: "data.body")

json.footer "Made with hearts"
```

#### **`show.js`**

Superglue embraces Unobtrusive Javascript. Add a `data-sg-remote` to any link,
and superglue will take care of making the fetch call.

```js
import React from 'react'

export default function GreetShow({
  body,
  footer,
  loadGreetPath
}) {
  const {greet} = body

  return (
    <h1>{greet || "Waiting for greet"}</h1>
    <a href={loadGreetPath} data-sg-remote>Greet!</a>
    <span>{footer}</span>
  )
}
```

#### **`show.js` alternative**

This version does the same thing. Every page component receives a `remote` and
`visit` thunk.

```js
import React from 'react'

export default function GreetShow({
  body,
  remote,
  footer,
  loadGreetPath
}) {
  const {greet} = body
  const handleClick = (e) => {
    e.preventDefault()
    remote(loadGreetPath)
  }

  return (
    <h1>{greet || "Waiting for greet"}</h1>
    <a href={loadGreetPath} onClick={handleClick}>Greet!</a>
    <span>{footer}</span>
  )
}
```


<!-- tabs:end -->

<!-- panels:end -->

#### 8. Finish

And that's it. Now you have a button that will load content in async fashion,
but how does it all work? Lets take a look at `loadGreetPath`

```
/greet?props_at=data.greet
```

The shape of `show.json.props` is exactly the same as what is stored in the
redux store on `pages["/greet"]`. With a single keypath on `props_at` we
grabbed the content at `data.greet` from `show.json.props` AND stored it on
`data.greet` on `pages["/greet"]`.

Now that's productive!


<!-- panels:start -->

<!-- div:title-panel -->

#### 9. Improvements
<!-- div:left-panel -->
In practice, there's a far simpler solution: `defer: :auto`, which would do all of the
above without a button.

<!-- div:right-panel -->

<!-- tabs:start -->
#### **`show.json.props`**

The only change needed would be to use the `:auto` option with a placeholder.
The response would tell Superglue to:

1. Save the page (with the placeholder)
1. Look for any deferred nodes
2. Automatically create a remote request for the missing node

```ruby
json.body(defer: [:auto, placeholder: { greet: "Waiting for Greet"})
  sleep 5
  json.greet "Hello world"
end

json.footer "Made with hearts"
```

#### **`show.js`**

No changes to the original `show.js` component. We don't even have to create
a conditional, the initial page response will contain a placeholder.

```js
import React from 'react'

export default function GreetShow({
  body,
  footer
}) {
  const {greet} = body

  return (
    <h1>{greet}</h1>
    <span>{footer}</span>
  )
}
```

<!-- tabs:end -->

<!-- panels:end -->

