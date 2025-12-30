input_file = open('src/assets/short_words.txt', 'r')
output_file = open('src/assets/usable_words.txt', 'w')

for line in input_file:
	word = line.strip()
	if len(word) < 3:
		continue
	for c in word.lower():
		if c not in 'abcdefghijklmnopqrstuvwxyz':
			break
	else:
		output_file.write(word.upper() + '\n')

input_file.close()
output_file.close()