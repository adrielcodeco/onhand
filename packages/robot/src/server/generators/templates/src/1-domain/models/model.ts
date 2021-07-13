export class <%= model.name %> {
<% model.properties.forEach(function(property) { %>
  <%= property.name %><% if (property.optional) { %>?<% } else { %>!<% } %>: <%= property.type %>
<% } %>
}
