# Build, run, or clean every week's lecture examples from one place.
# Command-line overrides, such as CFLAGS=..., pass through to recursive make.

EXAMPLE_DIRS = week01-struct/examples \
               week02-operators/examples \
               week03-dynamic-memory-singly-list/examples \
               week04-doubly-circular-list/examples \
               week05-intrusive-list/examples \
               week06-container-of/examples \
               week07-file-io/examples \
               week08-final-project/examples

all: $(EXAMPLE_DIRS)

$(EXAMPLE_DIRS):
	$(MAKE) -C $@

run:
	@set -e; for directory in $(EXAMPLE_DIRS); do \
		$(MAKE) -C "$$directory" run; \
	done

clean:
	@set -e; for directory in $(EXAMPLE_DIRS); do \
		$(MAKE) -C "$$directory" clean; \
	done

.PHONY: all run clean $(EXAMPLE_DIRS)
