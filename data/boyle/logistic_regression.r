# read full dataset
training.data.raw <- read.csv('dyad_data_master.csv', header=T, na.strings=c(""))
individual.data.raw <- read.csv('individual_data.csv', header=T, na.strings=c(""))

summ <- summary(subset(training.data.raw, select = -c(dyad) ))
summ['Std.'] <- round(sd(summ), 2)

apply(subset(training.data.raw, select = -c(dyad)), 2, sd, na.rm = TRUE)

hist(training.data.raw$age)
hist(individual.data.raw$Age)

summ <- summary(subset(training.data.raw, select = -c(dyad) ))
summ["Std."] <- round(sd(subset(training.data.raw, select = -c(dyad) )), 2)
summ[1,4]

summary(training.data.raw)
# import Amelia to plot fancy graph
library(Amelia)

#my_data = subset(training.data.raw, select = -c(dyad) )
#cor(my_data, method = "pearson")

#library("Hmisc")
#res2 <- rcorr(as.matrix(my_data))
#res2

#df.rcx.p=data.frame(res2$r)

#write.csv(df.rcx.p,"res2_r.csv")

# plot fancy graph
#missmap(training.data.raw, main = "Missing values vs observed")

# print missing values
#sapply(training.data.raw, function(x) sum(is.na(x)))

# print unique values
#sapply(training.data.raw, function(x) length(unique(x)))

# name relevant cols
cols <- c('team', 'social_tie', 'mutual', 'avg_rating', 'age', 'gender')
indv_cols <- c('Team','Age','Ethnicity','Creativity','Prior.Social.Connections','Psychological.Collectivism','Social.Skills','Leadership','Intercultural.Sensitivity','Imagination','Extraversion','Emotional.Stability','Agreeableness','Conscientiousness','Concrete.Design','Content.Strategy','Site.Strategy','Technology.Strategy','User.Research','Content.Production','Project.Management','Abstract.Design','Technology.Implementation') # extract relevant cols
#data <- subset(training.data.raw, select = cols)
data <- subset(training.data.raw, interacted == 0, select = -c(mutual, dyad, social_tie_avg, u_r, s_s, t_s, c_s, a_d, t_i, c_p, c_d, p_m))
indv_data <- subset(individual.data.raw, select = indv_cols)

indv.pca <- prcomp(indv_data, center = TRUE, scale. = TRUE)
summary(indv.pca)

library(devtools)
library(ggbiplot)

ggbiplot(indv.pca)

ggbiplot(indv.pca, labels=rownames(individual.data.raw$Code))


#data <- subset(data, social_tie == 0, select = -c(social_tie))

ggbiplot(indv.pca,ellipse=TRUE,  labels=rownames(individual.data.raw$Preferred.Name), groups=individual.data.raw$Team)


#my_data = subset(training.data.raw, select = -c(dyad) )


#data <- subset(data, social_tie == 0)

# replace NAs with the average of that variable
#data$openness[is.na(data$openness)] <- mean(data$openness,na.rm=T)

# check if categorical values encoded as factors
#is.factor(data$openness)
#is.factor(data$team)

# how are the variables dummyfied? nope, only applied to factors
#contrasts(data$openness)
#contrasts(data$team)

# subset into trains and test datasets
train <- data[1:700,]
test <- data[701:788,]

library(ggplot2)
ggplot(indv_data, aes(Intercultural.Sensitivity, Social.Skills, color = Team)) + geom_point()

# create model
model <- glm(team ~., family=binomial(link='logit'), data=train)
selectedMod <- step(model)

summary(selectedMod)
vif(selectedMod)

summary(model)

# anova
anova(selectedMod, test="Chisq")

library(pscl)
pR2(selectedMod)

?pR2

fitted.results <- predict(selectedMod,newdata=subset(test,select=cols),type='response')
#fitted.results <- predict(selectedMod,newdata=subset(test),type='response')
fitted.results <- ifelse(fitted.results > 0.5, 1, 0)
misClasificError <- mean(fitted.results != test$team)
print(paste('Accuracy', 1 - misClasificError))

  
library(ROCR)
p <- predict(selectedMod, newdata=subset(test), type="response")
pr <- prediction(p, test$team)
prf <- performance(pr, measure = "tpr", x.measure = "fpr")
plot(prf)

auc <- performance(pr, measure = "auc")
auc <- auc@y.values[[1]]
auc
