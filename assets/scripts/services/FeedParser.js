const FeedParser = source => {
	function fetchattr(item, tagName) {
		return item.getElementsByTagName(tagName)[0].textContent;
	}
	function parse(xml) {
		let items = [];
		let parser = new DOMParser();
		let DOMitems = parser.parseFromString(xml, 'application/xml').getElementsByTagName('item');
		for(let count = 0, len = DOMitems.length; count < len; count++) {
			items.push({
				date: fetchattr(DOMitems[count], 'pubDate'),
				title: fetchattr(DOMitems[count], 'title'),
				link: fetchattr(DOMitems[count], 'link'),
				description: fetchattr(DOMitems[count], 'description'),
				categories: fetchattr(DOMitems[count], 'category'),
			});
		}
		return items;
	}
	return parse(source);
}

export default FeedParser;
