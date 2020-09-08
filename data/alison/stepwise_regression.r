library(pscl)

### START LOGISTIC REGRESSION USED FOR PAPER REPORTING ###

## LOAD DATA ## 
training.data.raw <- read.csv('~/D4SD/Data_Parser/alison/csvs/alison_dyad_data_excluded.csv', header=T, na.strings=c(""))

## EXTRACT RELEVANT FEATURES ## 
data <- subset(data, select= c(social_tie_avg, avg_rating, interacted, age, gender, nationality, team))
data 

## 9/8/20, drop avg_rating in lieu of interacted ## 
data <- subset(data, select= -c(avg_rating))
data 

## FINAL CLEANING ## 
data[,1] <- data[,1] + 1 # scale social tie avg up
data

## RUN LOGISTIC REGRESSION MODEL ## 
model <- glm(team ~ social_tie_avg + interacted + gender + age + nationality, family = "binomial", data=data)
summary(model)

### END LOGISTIC REGRESSION USED FOR PAPER REPORTING ###

# read full data in
training.data.raw <- read.csv('~/D4SD/Data_Parser/alison/csvs/alison_dyad_data_excluded.csv', header=T, na.strings=c(""))

individual.data.raw <- read.csv('~/D4SD/Data_Parser/alison/csvs/individual_data.csv', header=T, na.strings=c(""))

indv_cols <- c('Age','Prior.Social.Connections','Social.Skills','Leadership','Intercultural.Sensitivity') # extract relevant cols
data <- subset(individual.data.raw, select = indv_cols)

# general stepwise regression... remove pillars and dyad labels
data <- subset(training.data.raw, select = -c(mutual, dyad, interacted, both_male, both_female, social_tie))
#data <- subset(training.data.raw, select = -c(mutual, dyad))

# min-max normalization
normalize <- function(x) {
  return ((x - min(x)) / (max(x) - min(x)))
}

# shuffle rows
set.seed(14)
rows <- sample(nrow(data))
data <- data[rows, ]

#hist(data$avg_rating)


data <- subset(data, select= c(social_tie_avg,avg_rating,age, gender, nationality, team))
mean(data$social_tie_avg)
sd(data$social_tie_avg)
mean(data$avg_rating)
sd(data$avg_rating)
mean(data$age)
sd(data$age)
mean(data$gender)
sd(data$gender)
mean(data$nationality)
sd(data$nationality)
mean(data$team)
sd(data$team)

# normalize data of important variables
data_vars <- subset(data, select= c(social_tie_avg,avg_rating,age, gender, nationality))
scaled.data <- as.data.frame(lapply(data_vars, normalize))

library("Hmisc")
corr <- rcorr(as.matrix(scaled.data))
corr$r
corr.r <- data.frame(corr$r)
write.csv(corr.r,"corr_r.csv")
corr.P <- data.frame(corr$P)
write.csv(corr.P,"corr_P.csv")

#hist(scaled.data$interacted)
#xhist(scaled.data$Social.Skills)
#hist(scaled.data$ixr)

scaled.data <- as.data.frame(lapply(data, normalize))
#scaled.data = subset(scaled.data, select = -c(intercultural_sensitivity, social_skills, leadership))

# subset into trains and test datasets
train <- scaled.data[1:800,]
test <- scaled.data[801:990,]

# create scaled model
scaled_model <- glm(team ~social_tie_avg + avg_rating + gender + age + nationality, family= "binomial", data=scaled.data)
summary(scaled_model)

# stepwise scaled model results
selected_scaled_model <- step(scaled_model)
summary(selected_scaled_model)

# create un-scaled model
data[,1] <- data[,1] + 1
data
model <- glm(team ~social_tie_avg + avg_rating + gender + age + nationality, family = "binomial", data=data)
summary(model)

# stepwise unscaled model results
selected_unscaled_model <- step(model)
summary(selected_unscaled_model)


pR2(model)

?pR2

confint(model)
exp(coef(model))
summary(model)
exp(cbind(OR = coef(model), confint(model)))

library(gmodels)

# out of the dyads that are in the same teams (109), 63 have the same gender, 46 are not.
CrossTable(data$gender, data$team)

# out of the dyads that knew each other (190), 41 are in the same team, 149 are not.
CrossTable(data$social_tie, data$team)

# out of the dyads that interacted using ProtoTeams (339), 23 are in the same team, 316 are not.
CrossTable(data$interacted, data$team)

# take out 0 ratings
filtered_data = subset(data, avg_rating != 0)
scaled.filtered_data <- as.data.frame(lapply(filtered_data, normalize))
model <- glm(team ~ social_tie_avg + avg_rating + gender + age + nationality, family = "binomial", data=scaled.filtered_data)
summary(model)
pR2(model)

hist(data$social_tie_avg)


CrossTable(training.data.raw$social_tie, training.data.raw$team)



plot(train$avg_rating, train$team, log="x")

all_vifs <- car::vif(model)
print(all_vifs)

signif_all <- names(all_vifs)

# Remove vars with VIF> 4 and re-build model until none of VIFs don't exceed 4.
while(any(all_vifs > 4)){
  var_with_max_vif <- names(which(all_vifs == max(all_vifs)))  # get the var with max vif
  signif_all <- signif_all[!(signif_all) %in% var_with_max_vif]  # remove
  myForm <- as.formula(paste("team ~ ", paste (signif_all, collapse=" + "), sep=""))  # new formula
  selectedMod <- glm(myForm, family=binomial(link='logit'), data=train)  # re-build model with new formula
  all_vifs <- car::vif(selectedMod)
}
summary(selectedMod)


all_vars <- names(selectedMod[[1]])[-1]  # names of all X variables
# Get the non-significant vars
summ <- summary(selectedMod)  # model summary
pvals <- summ$coefficients[, 4]  # get all p values
not_significant <- character()  # init variables that aren't statsitically significant
not_significant <- names(which(pvals > 0.1))
not_significant <- not_significant[!not_significant %in% "(Intercept)"]  # remove 'intercept'. Optional!

# If there are any non-significant variables, 
while(length(not_significant) > 0) {
  all_vars <- all_vars[!all_vars %in% not_significant[1]]
  myForm <- as.formula(paste("team ~ ", paste (all_vars, collapse=" + "), sep=""))  # new formula
  selectedMod <- glm(myForm, family=binomial(link='logit'), data=train)  # re-build model with new formula
  
  # Get the non-significant vars.
  summ <- summary(selectedMod)
  pvals <- summ$coefficients[, 4]  # get all p values
  not_significant <- character()
  not_significant <- names(which(pvals > 0.1))
  not_significant <- not_significant[!not_significant %in% "(Intercept)"]
}
summary(selectedMod)

# anova
anova(selectedMod, test="Chisq")

pR2(selectedMod)
?pR2

library(ResourceSelection)
hoslem.test(train$team, fitted(selectedMod), g=10)

varImp(selectedMod)

?hoslem.test
fitted.results <- predict(selectedMod, newdata=subset(test), type='response')
fitted.results <- ifelse(fitted.results > 0.5, 1, 0)
misClasificError <- mean(fitted.results != test$team)
print(paste('Accuracy =', 1 - misClasificError))


library(ROCR)
p <- predict(selectedMod, newdata=subset(test), type="response")
pr <- prediction(p, test$team)
prf <- performance(pr, measure = "tpr", x.measure = "fpr")
plot(prf)

auc <- performance(pr, measure = "auc")
auc <- auc@y.values[[1]]
auc
