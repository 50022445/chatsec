defmodule ChatsecWeb.ErrorHTML do
  @moduledoc """
  This module is invoked by your endpoint in case of errors on HTML requests.

  See config/config.exs.
  """
  use ChatsecWeb, :html

  # If you want to customize your error pages,
  # uncomment the embed_templates/1 call below
  # and add pages to the error directory:
  #
  #   * lib/chatsec_web/controllers/error_html/404.html.heex
  #   * lib/chatsec_web/controllers/error_html/500.html.heex
  #
  embed_templates "error_html/*"

  # embed_templates/1 above only covers the statuses that have a matching
  # .heex file (404, 500) - any other status Phoenix asks for (400 from a
  # malformed request body, 403, 422, etc.) would otherwise crash with
  # "no \"<status>\" html template defined" instead of just responding. This
  # mirrors Phoenix's own un-customized default: a plain text page based on
  # the template name, e.g. "400.html" becomes "Bad Request". These statuses
  # are overwhelmingly bot/scanner traffic hitting nonexistent routes or
  # sending garbage bodies, not real users, so a plain fallback is enough.
  def render(template, _assigns) do
    Phoenix.Controller.status_message_from_template(template)
  end
end
