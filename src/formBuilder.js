(function(window, document, $){

var ELEMENTS = {
	container: function(html) { return $('<div>').html(html) },
	caption: function(title) { return $('<div>').html(title)},
	fieldset : function() { return $('<fieldset>') },
	text : function() { return $('<input type="text">') },
	password : function() { return $('<input type="password">') },
	submit : function() { return $('<button type="submit">') },
	reset : function() { return $('<input type="reset">') },
	hidden : function() { return $('<input type="hidden">') },
	radio : function() { return $('<input type="radio">') },
	checkbox : function() { return $('<input type="checkbox">') },
	file : function() { return $('<input type="file">') },
	number : function() { return $('<input type="number">') },
	email : function() { return $('<input type="email">') },
	select : function() { return $('<select>') },
	option : function(text) { return $('<option>').html(text) }
}


var formBuilder = function (formId, formData, config) {
	this.form = $(formId);
	this.data = formData;
	this.config = config;
	this.setUpForm();
}

var f = formBuilder.prototype;

f.setUpForm = function () {
	this.form.attr('method', this.data.method || 'post')
		.attr('action', this.data.action || location.pathname);
}

f.createFieldset = function (attrs) {
	var el = ELEMENTS.fieldset();
	var title = ELEMENTS.container(attrs.name);
	this._setAttribute(el, attrs, ['fields'])
	el.append(title);
	return el;
}

f.createField = function (attrs) {
	var self = this;
	var container = ELEMENTS.container();
	var caption = ELEMENTS.caption(attrs.caption);
	var el = ELEMENTS[attrs.type]();
	self._setAttribute(el, attrs);
	switch (attrs.type) {
		case 'select':
			attrs.options.forEach(function(option){
				var op = ELEMENTS.option(option.text);
				self._setAttribute(op, option);
				el.append(op);
			});
			break;
		case 'radiobuttons':
			attrs.options.forEach(function(option){
				var op = ELEMENTS.radio();
				self._setAttribute(op, option);
				el.append(op);
			});
			break;
		default:
			break;
	}
	return container.append(caption).append(el);
}

f._setAttribute = function (target, attrs, excludes) {
	excludes = excludes || ['type', 'caption', 'options', 'fields', 'text'] ;
	for (var attr in attrs) {
		if (attrs.hasOwnProperty(attr) && !~$.inArray(attr, excludes)) {
			target.attr(attr, attrs[attr]);
		}
	}
	return target;
}

f.write = function() {
	// forEach group
	//  group.append(member)
	// then form.append(group)
	var self = this;

	if (Object.prototype.toString.call(this.data.fieldsets) !== '[object Array]') {
		console.warn('Your input JSON file must have an array of fieldsets');
		return;
	}

	this.data.fieldsets.forEach(function(fieldset){
		var fs = self.createFieldset(fieldset);
		fieldset.fields.forEach(function(field){
			var f = self.createField(field);
			fs.append(f);
		})
		self.form.append(fs);
	})
}

f.update = function(formData) {
	var self = this;
	var id = formData.fieldsets[0].id;
	var $field = $('#' + id);
	var newData = formData.fieldsets[0].fields;
	var fieldIndex = 0;
	var oldData = self.data.fieldsets.filter(function(fieldset, index){
		if (fieldset.id === id) {
			fieldIndex = index;
			return true;
		}
		return false;
	})[0].fields;

	for(var i = 0, j = 0; i < newData.length; i++, j++) {
		if (deepEqual(newData[i], oldData[j])) {
			continue;
		} else if (deepEqual(newData[i], oldData[j+1])) {
			$('#' + oldData[j].id).remove();
			j++;
			continue;
		} else if (deepEqual(newData[i+1], oldData[j])) {
			$('#' + oldData[j-1].id).parent().after(self.createField(newData[i]));
			i++;
			continue;
		} else if (j < oldData.length) {
			$('#' + oldData[j].id).parent().replaceWith(self.createField(newData[i]));
		} else if (j >= oldData.length){
			$field.append(self.createField(newData[i]));
		}
	}
	$.extend(true, self.data.fieldsets[fieldIndex], formData.fieldsets[0]);
}

function deepEqual(a, b) {
	return JSON.stringify(a) === JSON.stringify(b);
}

window.formBuilder = formBuilder;

})(window, document, jQuery)