import sys

file_path = "/Users/rafayraza/Desktop/dataEntry/data-entry-app/src/app/(dashboard)/bird-view/page.tsx"

with open(file_path, "r") as f:
    lines = f.readlines()

# Find the start index: line containing "{/* Footer area line separator */}"
start_idx = -1
for i, line in enumerate(lines):
    if "{/* Footer area line separator */}" in line:
        start_idx = i
        break

# Find the end index: the </div> that closes Badges Container
# It comes before {/* Main Content */}
end_idx = -1
for i in range(start_idx, len(lines)):
    if "{/* Main Content */}" in lines[i]:
        end_idx = i - 1
        # go back to find the actual </div>, skipping empty lines
        while end_idx > start_idx and "</div>" not in lines[end_idx]:
            end_idx -= 1
        break

print("--- GRABBING ---")
print(lines[start_idx].strip())
print(lines[end_idx].strip())

block = lines[start_idx:end_idx+1]
del lines[start_idx:end_idx+1]

# Now find the insert index. We want to insert it right before the </div> that closes the task card.
# The task card ends before `);` and `})}` for items.map.
# Let's search for `Ex: {item.exercise}` and find the `</div>` after `Ds: {item.description}`
insert_idx = -1
for i, line in enumerate(lines):
    if "Ds: {item.description}" in line:
        # The next line is `</div>` (closes the text block)
        # The next next is `)}`
        # The next next next is `</div>` (closes the task card)
        insert_idx = i + 3
        break

print("--- INSERTING AT ---")
print(lines[insert_idx-1].strip())
print(lines[insert_idx].strip())

lines[insert_idx:insert_idx] = block

with open(file_path, "w") as f:
    f.writelines(lines)

print("Done")
