# read full dataset
training.data.raw <- read.csv('mock_full.csv', header=T, na.strings=c(""))

# import Amelia to plot fancy graph
library(Amelia)

# plot fancy graph
missmap(training.data.raw, main = "Missing values vs observed")

# print missing values
sapply(training.data.raw, function(x) sum(is.na(x)))

# print unique values
sapply(training.data.raw, function(x) length(unique(x)))

# name relevant cols
cols <- c('team', 'openness', 'interacted', 'ethnicity', 'gender', 'avg_social_tie')

# extract relevant cols
data <- subset(training.data.raw,select=cols)

# replace NAs with the average of that variable
data$openness[is.na(data$openness)] <- mean(data$openness,na.rm=T)

# check if categorical values encoded as factors
is.factor(data$openness)
is.factor(data$team)

# how are the variables dummyfied? nope, only applied to factors
#contrasts(data$openness)
#contrasts(data$team)

# subset into trains and test datasets
train <- data[1:115,]
test <- data[116:149,]

# create model
model <- glm(team ~.,family=binomial(link='logit'),data=train)
summary(model)

# anova
anova(model, test="Chisq")

library(pscl)
pR2(model)

fitted.results <- predict(model,newdata=subset(test,select=cols),type='response')
fitted.results <- ifelse(fitted.results > 0.5,1,0)
misClasificError <- mean(fitted.results != test$team)
print(paste('Accuracy',1-misClasificError))


library(ROCR)
p <- predict(model, newdata=subset(test,select=cols), type="response")
pr <- prediction(p, test$team)
prf <- performance(pr, measure = "tpr", x.measure = "fpr")
plot(prf)

auc <- performance(pr, measure = "auc")
auc <- auc@y.values[[1]]
auc
