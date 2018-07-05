$(document).ready(function () {
  $('input[name="action[addRow]"]').click(function () {
    var lastRow = $('.claim-amount-row, .multiline-row').last()
    var newRow = lastRow.clone()

    incrementDomNodesIds(newRow)
    sanitizeContent(newRow)

    lastRow.parent().append(newRow)

    return false
  })

  function incrementDomNodesIds (newRow) {
    newRow.html(function (index, oldHtml) {
      return oldHtml.replace(/rows\[(\d+)\]/g, function (match, capturedRowIndex) {
        return 'rows[' + (parseInt(capturedRowIndex) + 1) + ']'
      })
    })
  }

  function sanitizeContent (newRow) {
    newRow.find('input, textarea').val('')

    newRow.removeClass('govuk-form-group-error')
    newRow.find('*').removeClass('form-control-error')
    newRow.find('.error-message').remove()
  }
})
