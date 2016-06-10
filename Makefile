TSC=tsc
#CLOSURE=java -jar closure.jar
CLOSURE=closure

.DEFAULT: default
default: build ;

dist: build
	$(7zip) a -tzip -mx9 translate.zip content.min.js background.min.js manifest.json options.html options.min.js button_active.png button_inactive.png icon.png

build: content.min.js options.min.js background.min.js

content.min.js: content.js
	$(CLOSURE) -O SIMPLE $< --js_output_file $@
	
background.min.js: background.js
	$(CLOSURE) -O SIMPLE $< --js_output_file $@
	
options.min.js: options.js
	$(CLOSURE) -O SIMPLE $< --js_output_file $@
	
content.js: content.ts
	$(TSC) $< --outFile $@
	
background.js: background.ts
	$(TSC) $< --outFile $@
	
options.js: options.ts
	$(TSC) $< --outFile $@
	
clean:
	rm -f background.min.js background.js content.min.js content.js options.min.js options.js