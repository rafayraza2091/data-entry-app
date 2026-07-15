import sys

file_path = "/Users/rafayraza/Desktop/dataEntry/data-entry-app/src/app/(dashboard)/bird-view/page.tsx"

with open(file_path, "r") as f:
    lines = f.readlines()

# Lines to move: 2038 to 2217 inclusive (0-indexed: 2037 to 2216)
# We want to insert them AFTER line 2383 (which is index 2382)
# Wait, wait... the indices will shift!
# Let's verify line contents first.

start_idx = 2033 # line 2034 is {/* Footer area line separator */}
end_idx = 2216 # line 2217 is }

# Let's print out what we are grabbing
print("--- GRABBING ---")
print(lines[start_idx].strip())
print(lines[end_idx].strip())

block = lines[start_idx:end_idx+1]
del lines[start_idx:end_idx+1]

# Now we need to find the new insert point. The original line 2383 was `)}` for the Main Content block.
# Since we deleted `end_idx - start_idx + 1` lines before it, the new index is 2383 - (end_idx - start_idx + 1).
# Let's just search for the end of the Main Content block.
insert_idx = -1
for i, line in enumerate(lines):
    if "</div>" in line and "Ex: {item.exercise}" in lines[i-3] and "Ds: {item.description}" in lines[i-1]:
        # This is line 2382 originally
        insert_idx = i + 2 # skip the </div> and )}
        break

print("--- INSERTING AT ---")
print(lines[insert_idx-1].strip())
print(lines[insert_idx].strip())

lines[insert_idx:insert_idx] = block

with open(file_path, "w") as f:
    f.writelines(lines)

print("Done")
