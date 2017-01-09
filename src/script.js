$(function(){

  $('#demo').click(function(){
	var v1=	$.ajax({
			url: 'data/form.json',
			dataType: 'json',
			isLocal: true
		});
	var v2 = $.ajax({
		url: 'data/validate.json',
		dataType: 'json',
		isLocal: true
	});
	
	$.when(v1, v2).then(function(formdata, validation){
			console.log(formdata[0]);
			window.form = new formBuilder('#myform', formdata[0]);
      form.write();
			window.formValidation = new validate('myform', validation[0]);
      $('#country').change(function(){
          url = 'data/' + $('#country').val() + '.json';
          $.ajax({
              url: url,
              dataType: 'json',
              isLocal: true
          }).then(function(data){
              console.log(data);
              form.update(data);
              formValidation.update();
          })
      })
		})
  })
})